'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Badge, Button, Card, Field, Stack, Text } from '@kazamitte/kazamitte-ui';
import type { ChallengeState, Idea, IdeaStatus } from '@/lib/challenge';
import { toaster } from './toaster';

const VOTED_KEY = 'voted-ideas';

const STATUS_BADGE: Record<Exclude<IdeaStatus, 'open'>, { label: string; tone: 'primary' | 'success' | 'base' }> = {
  adopted: { label: '実装中', tone: 'primary' },
  done: { label: '実装済み', tone: 'success' },
  rejected: { label: '見送り', tone: 'base' },
};

function loadVoted(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? '[]') as number[]);
  } catch {
    return new Set();
  }
}

function saveVoted(voted: Set<number>) {
  try {
    localStorage.setItem(VOTED_KEY, JSON.stringify([...voted]));
  } catch {
    // Private mode etc. — voting still works, it just isn't remembered.
  }
}

export function IdeaBox({
  ideas,
  adminToken,
  onUpdated,
}: {
  ideas: Idea[];
  adminToken: string | null;
  onUpdated: (state: ChallengeState) => void;
}) {
  const [title, setTitle] = useState('');
  const [voted, setVoted] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => setVoted(loadVoted()), []);

  async function call(payload: object) {
    setBusy(true);
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(adminToken ? { 'x-admin-token': adminToken } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 429) {
        toaster.create({ title: '投票済みか、操作が多すぎます。少し待ってね', type: 'warning' });
        return false;
      }
      if (!res.ok) throw new Error(String(res.status));
      onUpdated((await res.json()) as ChallengeState);
      return true;
    } catch {
      toaster.create({ title: '送信に失敗しました', type: 'error' });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (await call({ action: 'add', title })) {
      setTitle('');
      toaster.create({ title: 'アイデアを投稿しました 💡', type: 'success' });
    }
  }

  async function vote(id: number) {
    if (voted.has(id)) return;
    if (await call({ action: 'vote', id })) {
      const next = new Set(voted).add(id);
      setVoted(next);
      saveVoted(next);
    }
  }

  const top = ideas.find((i) => i.status === 'open');

  return (
    <Card.Root variant="elevated">
      <Card.Header>
        <Card.Title>💡 次に作る機能の投票箱</Card.Title>
        <Card.Description>
          一番票を集めた機能を、残り時間で実装します。アイデアの投稿と投票はどなたでもどうぞ
        </Card.Description>
      </Card.Header>
      <Card.Body>
        <Stack gap={6}>
          <form onSubmit={submit}>
            <Stack direction="row" gap={2} align="end">
              <div className="flex-1">
                <Field.Root>
                  <Field.Label>機能のアイデア</Field.Label>
                  <Field.Input
                    value={title}
                    maxLength={60}
                    placeholder="例：ダークモード"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field.Root>
              </div>
              <Button type="submit" disabled={busy || !title.trim()}>
                投稿
              </Button>
            </Stack>
          </form>

          {ideas.length === 0 ? (
            <Text tone="muted">まだアイデアはありません。最初のひとつをどうぞ！</Text>
          ) : (
            <ol className="flex flex-col gap-2">
              {ideas.map((idea) => {
                const badge = idea.status === 'open' ? null : STATUS_BADGE[idea.status];
                return (
                  <li key={idea.id}>
                    <Stack direction="row" gap={3} align="center" justify="between">
                      <Stack direction="row" gap={2} align="center" wrap>
                        <Text asChild textStyle="mono-16" weight="bold">
                          <span>{idea.votes}票</span>
                        </Text>
                        <Text asChild weight={idea === top ? 'bold' : undefined}>
                          <span>
                            {idea === top && '👑 '}
                            {idea.title}
                          </span>
                        </Text>
                        {badge && (
                          <Badge tone={badge.tone} size="sm">
                            {badge.label}
                          </Badge>
                        )}
                      </Stack>
                      <Stack direction="row" gap={1} align="center">
                        {idea.status === 'open' && (
                          <Button
                            size="sm"
                            variant={voted.has(idea.id) ? 'ghost' : 'outline'}
                            disabled={busy || voted.has(idea.id)}
                            onClick={() => void vote(idea.id)}
                          >
                            {voted.has(idea.id) ? '投票済み' : '👍 投票'}
                          </Button>
                        )}
                        {adminToken && (
                          <AdminStatusButtons
                            idea={idea}
                            onSet={(status) => void call({ action: 'status', id: idea.id, status })}
                          />
                        )}
                      </Stack>
                    </Stack>
                  </li>
                );
              })}
            </ol>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

function AdminStatusButtons({
  idea,
  onSet,
}: {
  idea: Idea;
  onSet: (status: IdeaStatus) => void;
}) {
  const next: { status: IdeaStatus; label: string }[] =
    idea.status === 'open'
      ? [
          { status: 'adopted', label: '採用' },
          { status: 'rejected', label: '見送り' },
        ]
      : idea.status === 'adopted'
        ? [{ status: 'done', label: '完了' }]
        : [{ status: 'open', label: '戻す' }];
  return next.map((n) => (
    <Button key={n.status} size="sm" variant="ghost" onClick={() => onSet(n.status)}>
      {n.label}
    </Button>
  ));
}
