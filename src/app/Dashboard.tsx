'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  Field,
  Heading,
  Progress,
  Stack,
  Stat,
  Steps,
  Text,
  Timer,
  Toaster,
} from '@kazamitte/kazamitte-ui';
import { CHALLENGE, MILESTONES, taunt, type ChallengeState } from '@/lib/challenge';
import { IdeaBox } from './IdeaBox';
import { toaster } from './toaster';

const START = new Date(CHALLENGE.startAt).getTime();
const END = new Date(CHALLENGE.endAt).getTime();
const POLL_MS = 5000;

const timeFormat = new Intl.DateTimeFormat('ja-JP', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tokyo',
});

const ADMIN_KEY = 'admin-token';

/**
 * Reads #admin=<token> (a fragment, so it never reaches the server or its
 * logs), moves it out of the URL into sessionStorage, and returns it.
 */
function takeAdminToken(): string | null {
  const fromUrl = new URLSearchParams(location.hash.slice(1)).get('admin');
  if (fromUrl) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  try {
    if (fromUrl) sessionStorage.setItem(ADMIN_KEY, fromUrl);
    return fromUrl ?? sessionStorage.getItem(ADMIN_KEY);
  } catch {
    return fromUrl;
  }
}

function formatTime(iso: string) {
  return timeFormat.format(new Date(iso));
}

export function Dashboard({ initialState }: { initialState: ChallengeState }) {
  const [state, setState] = useState(initialState);
  const [now, setNow] = useState<number | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (document.hidden) return;
    const res = await fetch('/api/state', { cache: 'no-store' });
    if (res.ok) setState((await res.json()) as ChallengeState);
  }, []);

  useEffect(() => {
    setNow(Date.now());
    setAdminToken(takeAdminToken());
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(() => void refresh(), POLL_MS);
    const onVisible = () => void refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const done = new Set(state.logs.map((l) => l.milestone).filter(Boolean));
  const completedSteps = MILESTONES.filter((m) => done.has(m.value)).length;

  const elapsedPct =
    now == null ? 0 : Math.min(100, Math.max(0, ((now - START) / (END - START)) * 100));
  const phase =
    now == null ? null : now < START ? 'before' : now >= END ? 'finished' : 'live';

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Stack gap={8}>
        <Stack gap={3}>
          <Stack direction="row" gap={2} align="center" wrap>
            {phase === 'live' && (
              <Badge tone="error" variant="solid">
                ● LIVE
              </Badge>
            )}
            {phase === 'finished' && (
              <Badge tone={completedSteps === MILESTONES.length ? 'success' : 'warning'} variant="solid">
                {completedSteps === MILESTONES.length ? '完走！' : '終了'}
              </Badge>
            )}
            {phase === 'before' && <Badge tone="info">開始前</Badge>}
            <Text textStyle="dense-14" tone="muted">
              {formatTime(CHALLENGE.startAt)} – {formatTime(CHALLENGE.endAt)} JST
            </Text>
          </Stack>
          <Heading level={1} size="display-44">
            {CHALLENGE.title}
          </Heading>
          {now != null && (
            <Text textStyle="body-20" tone="strong" weight="bold" aria-live="polite">
              {taunt(END - now, completedSteps, MILESTONES.length)}
            </Text>
          )}
          <Text tone="muted">
            Next.js + 自作デザインシステム + Turso + Vercel。このページ自体がチャレンジの成果物です。
          </Text>
        </Stack>

        <div className="grid gap-4 md:grid-cols-3">
          <Card.Root variant="elevated" className="md:col-span-2">
            <Card.Header>
              <Card.Title>残り時間</Card.Title>
            </Card.Header>
            <Card.Body>
              <Stack gap={4}>
                {now != null && phase !== 'finished' && (
                  <Timer
                    key={phase}
                    countdown
                    autoStart
                    startMs={Math.max(0, END - (phase === 'before' ? START : now))}
                    controls={false}
                  />
                )}
                {phase === 'finished' && (
                  <Text textStyle="body-20" tone="strong">
                    タイムアップ！
                  </Text>
                )}
                <Progress
                  value={Math.round(elapsedPct)}
                  label="経過時間"
                  showValueText
                  tone={elapsedPct > 85 ? 'error' : elapsedPct > 60 ? 'warning' : 'primary'}
                />
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root variant="elevated">
            <Card.Body>
              <Stack gap={6}>
                <Stat.Root>
                  <Stat.Label>応援</Stat.Label>
                  <Stat.ValueText>{state.cheerCount} 🔥</Stat.ValueText>
                </Stat.Root>
                <Stat.Root>
                  <Stat.Label>マイルストーン</Stat.Label>
                  <Stat.ValueText>
                    {completedSteps} / {MILESTONES.length}
                  </Stat.ValueText>
                </Stat.Root>
              </Stack>
            </Card.Body>
          </Card.Root>
        </div>

        <Card.Root>
          <Card.Header>
            <Card.Title>進捗</Card.Title>
          </Card.Header>
          <Card.Body>
            <Steps.Root steps={MILESTONES} step={completedSteps}>
              <Steps.Progress />
            </Steps.Root>
          </Card.Body>
        </Card.Root>

        <IdeaBox ideas={state.ideas} adminToken={adminToken} onUpdated={setState} />

        {adminToken && <AdminForm token={adminToken} doneSet={done} onPosted={setState} />}

        <div className="grid gap-4 md:grid-cols-2">
          <Card.Root>
            <Card.Header>
              <Card.Title>開発ログ</Card.Title>
              <Card.Description>最新のものが上に表示されます</Card.Description>
            </Card.Header>
            <Card.Body>
              {state.logs.length === 0 ? (
                <Text tone="muted">まだログはありません</Text>
              ) : (
                <ol className="flex flex-col gap-3">
                  {state.logs.map((log) => (
                    <li key={log.id}>
                      <Stack direction="row" gap={2} align="center" wrap>
                        <Text asChild textStyle="mono-14" tone="muted">
                          <time dateTime={log.createdAt}>{formatTime(log.createdAt)}</time>
                        </Text>
                        {log.milestone && (
                          <Badge tone="success" size="sm">
                            ✓ {MILESTONES.find((m) => m.value === log.milestone)?.title}
                          </Badge>
                        )}
                      </Stack>
                      <Text>{log.body}</Text>
                    </li>
                  ))}
                </ol>
              )}
            </Card.Body>
          </Card.Root>

          <CheerCard state={state} onPosted={setState} />
        </div>
      </Stack>
      <Toaster toaster={toaster} />
    </main>
  );
}

function CheerCard({
  state,
  onPosted,
}: {
  state: ChallengeState;
  onPosted: (state: ChallengeState) => void;
}) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/cheer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });
      if (!res.ok) throw new Error(String(res.status));
      onPosted((await res.json()) as ChallengeState);
      setMessage('');
      toaster.create({ title: '応援ありがとう！🔥', type: 'success' });
    } catch {
      toaster.create({ title: '送信に失敗しました', type: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>応援する</Card.Title>
        <Card.Description>空欄のまま送っても 🔥 が届きます</Card.Description>
      </Card.Header>
      <Card.Body>
        <Stack gap={6}>
          <form onSubmit={submit}>
            <Stack gap={3}>
              <Field.Root>
                <Field.Label>名前</Field.Label>
                <Field.Input
                  value={name}
                  maxLength={30}
                  placeholder="名無しさん"
                  onChange={(e) => setName(e.target.value)}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>ひとこと</Field.Label>
                <Field.Textarea
                  value={message}
                  maxLength={140}
                  rows={2}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Field.Root>
              <div>
                <Button type="submit" disabled={sending}>
                  🔥 応援を送る
                </Button>
              </div>
            </Stack>
          </form>
          <ul className="flex flex-col gap-3">
            {state.cheers.map((c) => (
              <li key={c.id}>
                <Stack direction="row" gap={2} align="center">
                  <Text textStyle="dense-14" weight="bold">
                    {c.name}
                  </Text>
                  <Text asChild textStyle="mono-14" tone="muted">
                    <time dateTime={c.createdAt}>{formatTime(c.createdAt)}</time>
                  </Text>
                </Stack>
                <Text>{c.message}</Text>
              </li>
            ))}
          </ul>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

function AdminForm({
  token,
  doneSet,
  onPosted,
}: {
  token: string;
  doneSet: Set<string | null>;
  onPosted: (state: ChallengeState) => void;
}) {
  const [body, setBody] = useState('');
  const [milestone, setMilestone] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ body, milestone: milestone || null }),
    });
    if (!res.ok) {
      toaster.create({ title: `投稿失敗 (${res.status})`, type: 'error' });
      return;
    }
    onPosted((await res.json()) as ChallengeState);
    setBody('');
    setMilestone('');
    toaster.create({ title: 'ログを投稿しました', type: 'success' });
  }

  return (
    <Card.Root variant="subtle">
      <Card.Header>
        <Card.Title>管理：ログを投稿</Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={submit}>
          <Stack gap={3}>
            <Field.Root required>
              <Field.Label>内容</Field.Label>
              <Field.Textarea value={body} rows={2} onChange={(e) => setBody(e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label>マイルストーン達成</Field.Label>
              <Field.Select value={milestone} onChange={(e) => setMilestone(e.target.value)}>
                <option value="">なし</option>
                {MILESTONES.filter((m) => !doneSet.has(m.value)).map((m) => (
                  <option key={m.value} value={m.value}>
                    {String(m.title)}
                  </option>
                ))}
              </Field.Select>
            </Field.Root>
            <div>
              <Button type="submit">投稿</Button>
            </div>
          </Stack>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
