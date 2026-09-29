'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Heading, Stack, Text } from '@kazamitte/kazamitte-ui';
import { CHALLENGE, MILESTONES, REACTIONS, type ChallengeState } from '@/lib/challenge';
import { MAX_COMBO_KEY } from './useMash';

type Line = { label: string; value: string; note?: string };

const minutesBetween = (from: string, to: string) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60_000);

/** Result card shown once the 60 minutes are up. */
export function ResultScreen({ state, onClose }: { state: ChallengeState; onClose: () => void }) {
  const [maxCombo, setMaxCombo] = useState(0);
  useEffect(() => {
    try {
      setMaxCombo(Number(localStorage.getItem(MAX_COMBO_KEY) ?? 0));
    } catch {
      // No storage: the combo stat just shows 0.
    }
  }, []);

  const totalReactions = REACTIONS.reduce((s, e) => s + (state.reactions[e] ?? 0), 0);
  const hottest = [...REACTIONS].sort(
    (a, b) => (state.reactions[b] ?? 0) - (state.reactions[a] ?? 0),
  )[0];
  const done = new Set(state.logs.map((l) => l.milestone));
  const milestones = MILESTONES.filter((m) => done.has(m.value)).length;
  const deployLog = state.logs.find((l) => l.milestone === 'deploy');
  const ideasDone = state.ideas.filter((i) => i.status === 'done').length;

  const lines: Line[] = [
    { label: 'マイルストーン', value: `${milestones} / ${MILESTONES.length}` },
    ...(deployLog
      ? [{ label: '初回デプロイまで', value: `${minutesBetween(CHALLENGE.startAt, deployLog.createdAt)}分` }]
      : []),
    { label: '応援', value: `🔥 ${state.cheerCount}` },
    { label: 'リアクション', value: `${totalReactions}`, note: `いちばん多かったのは ${hottest}` },
    { label: 'あなたの最大コンボ', value: `×${maxCombo}` },
    { label: '開発ログ', value: `${state.logs.length}件` },
    { label: '投票から実装した機能', value: `${ideasDone}件` },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
      className="fixed inset-0 z-40 overflow-y-auto bg-(--r-base-bg)/95 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Stack gap={6}>
          <Stack gap={2} align="center">
            <Badge tone="success" variant="solid">
              RESULT
            </Badge>
            <Heading level={2} size="display-48" id="result-title" className="text-center">
              60分、完走。
            </Heading>
            <Text tone="muted" className="text-center">
              見に来てくれた人、応援してくれた人、ありがとうございました。
            </Text>
          </Stack>

          <dl className="grid gap-3 sm:grid-cols-2">
            {lines.map((l) => (
              <div
                key={l.label}
                className="rounded-lg border border-(--r-base-border) bg-(--r-base-bg-subtle) p-4"
              >
                <dt>
                  <Text asChild textStyle="dense-14" tone="muted">
                    <span>{l.label}</span>
                  </Text>
                </dt>
                <dd>
                  <Text asChild textStyle="mono-18" tone="strong" weight="bold">
                    <span className="text-3xl">{l.value}</span>
                  </Text>
                </dd>
                {l.note && (
                  <dd>
                    <Text asChild textStyle="dense-14">
                      <span>{l.note}</span>
                    </Text>
                  </dd>
                )}
              </div>
            ))}
          </dl>

          <Stack direction="row" gap={2} justify="center" wrap>
            <Button asChild>
              <a
                href={`https://x.com/intent/post?text=${encodeURIComponent(
                  `60分でアプリをデプロイするチャレンジ、完走しました🔥\n`,
                )}&url=${encodeURIComponent('https://one-hour-challenge.vercel.app')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                結果をポストする
              </a>
            </Button>
            <Button variant="outline" onClick={onClose}>
              ページに戻る
            </Button>
          </Stack>
        </Stack>
      </div>
    </div>
  );
}
