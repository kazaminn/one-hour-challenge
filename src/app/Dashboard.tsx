'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  Field,
  Heading,
  Progress,
  Separator,
  Stack,
  Text,
  Timer,
  Toaster,
} from '@kazamitte/kazamitte-ui';
import { CHALLENGE, MILESTONES, taunt, type ChallengeState } from '@/lib/challenge';
import { IdeaBox } from './IdeaBox';
import { Journey } from './Journey';
import { Reactions } from './Reactions';
import { ThemeToggle } from './ThemeToggle';
import { useMash } from './useMash';
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
const CHEER_NAME_KEY = 'cheer-name';

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

export function Dashboard({
  initialState,
  serverNow,
}: {
  initialState: ChallengeState;
  serverNow: number;
}) {
  const [state, setState] = useState(initialState);
  const [now, setNow] = useState<number | null>(serverNow);
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
  const finished = phase === 'finished';

  const deployLog = state.logs.find((l) => l.milestone === 'deploy');
  const firstDeployMin = deployLog
    ? Math.round((new Date(deployLog.createdAt).getTime() - START) / 60_000)
    : null;
  const totalReactions = Object.values(state.reactions).reduce((s, n) => s + (n ?? 0), 0);

  const facts = [
    { label: '最初の公開まで', value: firstDeployMin != null ? `${firstDeployMin}分` : '—' },
    { label: '作業の記録', value: `${state.logs.length}件` },
    { label: '届いた応援', value: `${state.cheerCount}` },
    { label: 'リアクション', value: `${totalReactions}` },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Stack gap={8}>
        <div className="grid items-start gap-6 md:grid-cols-[1fr_auto]">
          <Stack gap={4}>
            <Stack direction="row" gap={2} align="center" wrap>
              {phase === 'live' && (
                <Badge tone="error" variant="solid">
                  ● LIVE 制作中
                </Badge>
              )}
              {finished && (
                <Badge tone="success" variant="solid">
                  {completedSteps === MILESTONES.length ? '✓ 60分で完成しました' : '終了しました'}
                </Badge>
              )}
              {phase === 'before' && <Badge tone="info">まもなく開始</Badge>}
              <Text textStyle="dense-14" tone="muted">
                {formatTime(CHALLENGE.startAt)} – {formatTime(CHALLENGE.endAt)}
              </Text>
              <ThemeToggle />
            </Stack>

            <Heading level={1} size="display-44" className="max-md:text-highlight-28">
              {CHALLENGE.title}
            </Heading>

            <Text textStyle="body-18">
              {finished
                ? 'エンジニアが AI（Claude）と一緒に、ゼロからこのページを60分で作って公開しました。いま見ているこのページが、その完成品です。'
                : 'エンジニアが AI（Claude）と一緒に、ゼロからこのページを作っています。いま見ているこのページが、まさに作っている最中のアプリです。'}
            </Text>

            {phase === 'live' && now != null && (
              <Text textStyle="body-18" tone="strong" weight="bold" aria-live="polite">
                {taunt(END - now, completedSteps, MILESTONES.length)}
              </Text>
            )}

            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="rounded-lg border border-(--r-base-border) bg-(--r-base-bg-subtle) px-3 py-2"
                >
                  <dt>
                    <Text asChild textStyle="dense-14" tone="muted">
                      <span>{f.label}</span>
                    </Text>
                  </dt>
                  <dd>
                    <Text asChild textStyle="mono-18" tone="strong" weight="bold">
                      <span className="text-2xl tabular-nums">{f.value}</span>
                    </Text>
                  </dd>
                </div>
              ))}
            </dl>

            <nav aria-label="このページでできること">
              <Stack direction="row" gap={2} wrap>
                <Button asChild variant="outline" size="sm">
                  <a href="#message">💬 メッセージを送る</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="#ideas">💡 次に作る機能に投票</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href="#journey">📜 60分のあゆみを読む</a>
                </Button>
              </Stack>
            </nav>
          </Stack>

          <QuickCheer count={state.cheerCount} onCheered={setState}>
            <Reactions reactions={state.reactions} onUpdated={setState} />
          </QuickCheer>
        </div>

        {!finished && (
          <Card.Root variant="elevated">
            <Card.Header>
              <Card.Title>残り時間</Card.Title>
            </Card.Header>
            <Card.Body>
              <Stack gap={4}>
                {now != null && (
                  <Timer
                    key={phase}
                    countdown
                    autoStart
                    startMs={Math.max(0, END - (phase === 'before' ? START : now))}
                    controls={false}
                  />
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
        )}

        <div className="grid items-start gap-4 md:grid-cols-2">
          <CheerCard state={state} onPosted={setState} />
          <Journey logs={state.logs} live={!finished} />
        </div>

        <div id="ideas" className="scroll-mt-6">
          <IdeaBox ideas={state.ideas} adminToken={adminToken} onUpdated={setState} />
        </div>

        {adminToken && <AdminForm token={adminToken} doneSet={done} onPosted={setState} />}

        <footer className="border-t border-(--r-base-border) pt-6">
          <Text textStyle="dense-14" tone="muted">
            使った技術：Next.js / 自作デザインシステム（kazamitte-ui）/ Turso / Vercel　·{' '}
            <a
              href="https://github.com/kazaminn/one-hour-challenge"
              className="underline underline-offset-2"
            >
              ソースコード（GitHub）
            </a>
          </Text>
        </footer>
      </Stack>
      <Toaster toaster={toaster} />
    </main>
  );
}

/** One-tap cheer at the top of the page: no name, no message, just 🔥. */
function QuickCheer({
  count,
  onCheered,
  children,
}: {
  count: number;
  onCheered: (state: ChallengeState) => void;
  children?: React.ReactNode;
}) {
  const { tap, pending, combo } = useMash(async (times) => {
    try {
      const res = await fetch('/api/cheer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ times }),
      });
      if (res.status === 429) {
        toaster.create({ title: '応援が熱すぎます🔥 少し冷ましてね', type: 'warning' });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      onCheered((await res.json()) as ChallengeState);
    } catch {
      toaster.create({ title: '送信に失敗しました', type: 'error' });
    }
  });
  const shown = count + pending;

  return (
    <Card.Root id="cheer" variant="elevated" className="scroll-mt-6 md:w-64">
      <Card.Body>
        <Stack gap={3} align="center">
          <Text asChild textStyle="dense-14" weight="bold">
            <span>ボタンで応援しよう</span>
          </Text>
          <output
            key={shown}
            className="inline-block font-mono text-4xl font-bold tabular-nums text-(--r-base-fg-strong) motion-safe:animate-[cheer-pop_300ms_ease-out]"
          >
            🔥 {shown}
          </output>
          {/* touch-manipulation: stops iOS double-tap zoom from eating rapid taps. */}
          <Button size="lg" className="w-full touch-manipulation select-none" onClick={tap}>
            {combo > 1 ? `×${combo} COMBO!!` : '🔥 応援する'}
          </Button>
          <Text asChild textStyle="dense-14" tone="muted">
            <span>何回でも押せます（連打OK）</span>
          </Text>
          <Separator />
          <Text asChild textStyle="dense-14" tone="muted">
            <span>絵文字は見ている全員の画面に飛びます</span>
          </Text>
          {children}
        </Stack>
      </Card.Body>
    </Card.Root>
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
  const [mine, setMine] = useState<Set<number>>(new Set());

  // Remember the name so repeat cheerers don't retype it.
  useEffect(() => {
    try {
      setName(localStorage.getItem(CHEER_NAME_KEY) ?? '');
    } catch {
      // Storage unavailable: the field just starts empty.
    }
  }, []);

  const trimmed = message.trim();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/cheer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, message: trimmed }),
      });
      if (res.status === 429) {
        toaster.create({ title: '少し時間をおいてから送ってください', type: 'warning' });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const { postedId, ...next } = (await res.json()) as ChallengeState & { postedId?: number };
      onPosted(next);
      if (postedId != null) setMine((m) => new Set(m).add(postedId));
      setMessage('');
      try {
        localStorage.setItem(CHEER_NAME_KEY, name);
      } catch {
        // Not remembered; fine.
      }
      toaster.create({ title: '応援ありがとう！🔥', type: 'success' });
    } catch {
      toaster.create({ title: '送信に失敗しました', type: 'error' });
    } finally {
      setSending(false);
    }
  }

  return (
    <Card.Root id="message" className="scroll-mt-6">
      <Card.Header>
        <Card.Title>💬 応援メッセージ</Card.Title>
        <Card.Description>ひとことどうぞ。書いたメッセージはここに並びます</Card.Description>
      </Card.Header>
      <Card.Body>
        <Stack gap={6}>
          <form onSubmit={submit}>
            <Stack gap={3}>
              <Field.Root>
                <Field.Label>メッセージ</Field.Label>
                <Field.Input
                  value={message}
                  maxLength={140}
                  enterKeyHint="send"
                  autoComplete="off"
                  placeholder="例：がんばれ〜！"
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Field.HelperText>{message.length} / 140</Field.HelperText>
              </Field.Root>
              <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
                <Field.Root>
                  <Field.Label>名前（任意・次回も使います）</Field.Label>
                  <Field.Input
                    value={name}
                    maxLength={30}
                    autoComplete="nickname"
                    placeholder="名無しさん"
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field.Root>
                <Button type="submit" disabled={sending || !trimmed} className="max-sm:w-full">
                  🔥 送る
                </Button>
              </div>
            </Stack>
          </form>

          {state.cheers.length === 0 ? (
            <Text tone="muted">まだメッセージはありません。最初のひとことをどうぞ</Text>
          ) : (
            <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
              {state.cheers.map((c) => (
                <li
                  key={c.id}
                  className={
                    mine.has(c.id)
                      ? 'rounded-lg bg-(--r-primary-bg-muted) px-3 py-2'
                      : 'rounded-lg bg-(--r-base-bg-subtle) px-3 py-2'
                  }
                >
                  <Stack direction="row" gap={2} align="center" justify="between">
                    <Text textStyle="dense-14" weight="bold" truncate>
                      {c.name}
                      {mine.has(c.id) && '（あなた）'}
                    </Text>
                    <Text asChild textStyle="mono-14" tone="muted">
                      <time dateTime={c.createdAt}>{formatTime(c.createdAt)}</time>
                    </Text>
                  </Stack>
                  <Text className="break-words">{c.message}</Text>
                </li>
              ))}
            </ul>
          )}
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
