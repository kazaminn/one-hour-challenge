import 'server-only';
import { createClient, type Client } from '@libsql/client';
import type { ChallengeState, Cheer, Idea, IdeaStatus, Log } from './challenge';

let client: Client | undefined;
let ready: Promise<void> | undefined;

function getClient(): Client {
  client ??= createClient({
    // Falls back to a local SQLite file so `pnpm dev` works without Turso.
    url: process.env.TURSO_DATABASE_URL ?? 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return client;
}

async function db(): Promise<Client> {
  const c = getClient();
  ready ??= c
    .batch(
      [
        `CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          body TEXT NOT NULL,
          milestone TEXT,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        )`,
        `CREATE TABLE IF NOT EXISTS cheers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        )`,
        `CREATE TABLE IF NOT EXISTS ideas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          votes INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'open',
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        )`,
        `CREATE TABLE IF NOT EXISTS reactions (
          emoji TEXT PRIMARY KEY,
          n INTEGER NOT NULL DEFAULT 0
        )`,
        // Counters that don't need a row per event (e.g. one-tap cheers).
        `CREATE TABLE IF NOT EXISTS stats (
          key TEXT PRIMARY KEY,
          n INTEGER NOT NULL DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS hits (
          key TEXT NOT NULL,
          at INTEGER NOT NULL
        )`,
        'CREATE INDEX IF NOT EXISTS hits_key_at ON hits (key, at)',
        'CREATE INDEX IF NOT EXISTS hits_at ON hits (at)',
      ],
      'write',
    )
    .then(() => undefined);
  await ready;
  return c;
}

export async function getState(): Promise<ChallengeState> {
  const c = await db();
  const [logs, cheers, count, ideas, reactions] = await c.batch(
    [
      'SELECT id, body, milestone, created_at FROM logs ORDER BY created_at DESC, id DESC LIMIT 100',
      'SELECT id, name, message, created_at FROM cheers ORDER BY id DESC LIMIT 50',
      // One-tap cheers live in a counter; only cheers with a message get a row,
      // so this COUNT stays small.
      `SELECT (SELECT COUNT(*) FROM cheers)
            + COALESCE((SELECT n FROM stats WHERE key = 'quick_cheers'), 0) AS n`,
      'SELECT id, title, votes, status FROM ideas ORDER BY votes DESC, id ASC LIMIT 30',
      'SELECT emoji, n FROM reactions',
    ],
    'read',
  );
  return {
    reactions: Object.fromEntries(reactions.rows.map((r) => [String(r.emoji), Number(r.n)])),
    ideas: ideas.rows.map(
      (r): Idea => ({
        id: Number(r.id),
        title: String(r.title),
        votes: Number(r.votes),
        status: String(r.status) as IdeaStatus,
      }),
    ),
    logs: logs.rows.map(
      (r): Log => ({
        id: Number(r.id),
        body: String(r.body),
        milestone: r.milestone == null ? null : String(r.milestone),
        createdAt: String(r.created_at),
      }),
    ),
    cheers: cheers.rows.map(
      (r): Cheer => ({
        id: Number(r.id),
        name: String(r.name),
        message: String(r.message),
        createdAt: String(r.created_at),
      }),
    ),
    cheerCount: Number(count.rows[0]?.n ?? 0),
  };
}

export async function addLog(body: string, milestone: string | null) {
  const c = await db();
  await c.execute({
    sql: 'INSERT INTO logs (body, milestone) VALUES (?, ?)',
    args: [body, milestone],
  });
}

/** Returns the new cheer's id so the poster can recognise their own message. */
export async function addCheer(name: string, message: string): Promise<number> {
  const c = await db();
  const res = await c.execute({
    sql: 'INSERT INTO cheers (name, message) VALUES (?, ?)',
    args: [name, message],
  });
  return Number(res.lastInsertRowid);
}

/** One-tap (possibly mashed) cheers: bump a counter instead of writing rows. */
export async function addQuickCheers(times: number) {
  const c = await db();
  await c.execute({
    sql: "INSERT INTO stats (key, n) VALUES ('quick_cheers', ?) ON CONFLICT(key) DO UPDATE SET n = n + excluded.n",
    args: [times],
  });
}

export async function addIdea(title: string) {
  const c = await db();
  await c.execute({ sql: 'INSERT INTO ideas (title, votes) VALUES (?, 1)', args: [title] });
}

export async function voteIdea(id: number) {
  const c = await db();
  await c.execute({
    sql: "UPDATE ideas SET votes = votes + 1 WHERE id = ? AND status = 'open'",
    args: [id],
  });
}

export async function setIdeaStatus(id: number, status: IdeaStatus) {
  const c = await db();
  await c.execute({ sql: 'UPDATE ideas SET status = ? WHERE id = ?', args: [status, id] });
}

/** Records a hit for `key` and returns how many it has within the window (this one included). */
export async function countRecentHits(key: string, windowSec: number): Promise<number> {
  const c = await db();
  const now = Math.floor(Date.now() / 1000);
  const [, , count] = await c.batch(
    [
      // Keep the table small: nothing older than an hour is ever needed.
      { sql: 'DELETE FROM hits WHERE at < ?', args: [now - 3600] },
      { sql: 'INSERT INTO hits (key, at) VALUES (?, ?)', args: [key, now] },
      {
        sql: 'SELECT COUNT(*) AS n FROM hits WHERE key = ? AND at >= ?',
        args: [key, now - windowSec],
      },
    ],
    'write',
  );
  return Number(count?.rows[0]?.n ?? 0);
}

export async function addReaction(emoji: string, times = 1) {
  const c = await db();
  await c.execute({
    sql: 'INSERT INTO reactions (emoji, n) VALUES (?, ?) ON CONFLICT(emoji) DO UPDATE SET n = n + excluded.n',
    args: [emoji, times],
  });
}
