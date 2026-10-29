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
          round INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        )`,
        `CREATE TABLE IF NOT EXISTS cheers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          message TEXT NOT NULL,
          round INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        )`,
        `CREATE TABLE IF NOT EXISTS ideas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          votes INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'open',
          round INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        )`,
        `CREATE TABLE IF NOT EXISTS reactions (${REACTIONS_COLUMNS})`,
        // Counters that don't need a row per event (e.g. one-tap cheers).
        `CREATE TABLE IF NOT EXISTS stats (${STATS_COLUMNS})`,
        `CREATE TABLE IF NOT EXISTS hits (
          key TEXT NOT NULL,
          at INTEGER NOT NULL
        )`,
        'CREATE INDEX IF NOT EXISTS hits_key_at ON hits (key, at)',
        'CREATE INDEX IF NOT EXISTS hits_at ON hits (at)',
      ],
      'write',
    )
    .then(() => migrateRounds(c));
  await ready;
  return c;
}

const REACTIONS_COLUMNS = `
  round INTEGER NOT NULL DEFAULT 1,
  emoji TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (round, emoji)`;

const STATS_COLUMNS = `
  round INTEGER NOT NULL DEFAULT 1,
  key TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (round, key)`;

async function hasRoundColumn(c: Client): Promise<boolean> {
  const res = await c.execute("SELECT 1 FROM pragma_table_info('reactions') WHERE name = 'round'");
  return res.rows.length > 0;
}

/**
 * Round 1 ran before the hub knew about rounds. Tag its rows as round 1 so
 * later rounds start empty. Runs once, in one transaction; a fresh database
 * already has the columns and skips it.
 */
async function migrateRounds(c: Client) {
  if (await hasRoundColumn(c)) return;
  try {
    await c.batch(
      [
        'ALTER TABLE logs ADD COLUMN round INTEGER NOT NULL DEFAULT 1',
        'ALTER TABLE cheers ADD COLUMN round INTEGER NOT NULL DEFAULT 1',
        'ALTER TABLE ideas ADD COLUMN round INTEGER NOT NULL DEFAULT 1',
        // Keyed counters: the round has to join the primary key, so rebuild them.
        `CREATE TABLE reactions_new (${REACTIONS_COLUMNS})`,
        'INSERT INTO reactions_new (round, emoji, n) SELECT 1, emoji, n FROM reactions',
        'DROP TABLE reactions',
        'ALTER TABLE reactions_new RENAME TO reactions',
        `CREATE TABLE stats_new (${STATS_COLUMNS})`,
        'INSERT INTO stats_new (round, key, n) SELECT 1, key, n FROM stats',
        'DROP TABLE stats',
        'ALTER TABLE stats_new RENAME TO stats',
      ],
      'write',
    );
  } catch (e) {
    // Another instance migrated first; its transaction won and ours rolled back.
    if (!(await hasRoundColumn(c))) throw e;
  }
}

export async function getState(round: number): Promise<ChallengeState> {
  const c = await db();
  const [logs, cheers, count, ideas, reactions] = await c.batch(
    [
      {
        sql: 'SELECT id, body, milestone, created_at FROM logs WHERE round = ? ORDER BY created_at DESC, id DESC LIMIT 100',
        args: [round],
      },
      {
        sql: 'SELECT id, name, message, created_at FROM cheers WHERE round = ? ORDER BY id DESC LIMIT 50',
        args: [round],
      },
      // One-tap cheers live in a counter; only cheers with a message get a row,
      // so this COUNT stays small.
      {
        sql: `SELECT (SELECT COUNT(*) FROM cheers WHERE round = ?1)
            + COALESCE((SELECT n FROM stats WHERE round = ?1 AND key = 'quick_cheers'), 0) AS n`,
        args: [round],
      },
      {
        sql: 'SELECT id, title, votes, status FROM ideas WHERE round = ? ORDER BY votes DESC, id ASC LIMIT 30',
        args: [round],
      },
      { sql: 'SELECT emoji, n FROM reactions WHERE round = ?', args: [round] },
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

export async function addLog(round: number, body: string, milestone: string | null) {
  const c = await db();
  await c.execute({
    sql: 'INSERT INTO logs (round, body, milestone) VALUES (?, ?, ?)',
    args: [round, body, milestone],
  });
}

/** Returns the new cheer's id so the poster can recognise their own message. */
export async function addCheer(round: number, name: string, message: string): Promise<number> {
  const c = await db();
  const res = await c.execute({
    sql: 'INSERT INTO cheers (round, name, message) VALUES (?, ?, ?)',
    args: [round, name, message],
  });
  return Number(res.lastInsertRowid);
}

/** One-tap (possibly mashed) cheers: bump a counter instead of writing rows. */
export async function addQuickCheers(round: number, times: number) {
  const c = await db();
  await c.execute({
    sql: "INSERT INTO stats (round, key, n) VALUES (?, 'quick_cheers', ?) ON CONFLICT(round, key) DO UPDATE SET n = n + excluded.n",
    args: [round, times],
  });
}

export async function addIdea(round: number, title: string) {
  const c = await db();
  await c.execute({
    sql: 'INSERT INTO ideas (round, title, votes) VALUES (?, ?, 1)',
    args: [round, title],
  });
}

// Ideas are only touched within their own round, so archived rounds stay frozen.
export async function voteIdea(round: number, id: number) {
  const c = await db();
  await c.execute({
    sql: "UPDATE ideas SET votes = votes + 1 WHERE id = ? AND round = ? AND status = 'open'",
    args: [id, round],
  });
}

export async function setIdeaStatus(round: number, id: number, status: IdeaStatus) {
  const c = await db();
  await c.execute({
    sql: 'UPDATE ideas SET status = ? WHERE id = ? AND round = ?',
    args: [status, id, round],
  });
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

export async function addReaction(round: number, emoji: string, times = 1) {
  const c = await db();
  await c.execute({
    sql: 'INSERT INTO reactions (round, emoji, n) VALUES (?, ?, ?) ON CONFLICT(round, emoji) DO UPDATE SET n = n + excluded.n',
    args: [round, emoji, times],
  });
}
