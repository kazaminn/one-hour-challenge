'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Heading, Stack, Text } from '@kazamitte/kazamitte-ui';
import { MILESTONES, REACTIONS, type ChallengeState } from '@/lib/challenge';
import { MAX_COMBO_KEY } from './useMash';

type Line = { label: string; value: string; note?: string };

/** Full-screen, screenshot-bait result card shown once the 60 minutes are up. */
export function ResultScreen({ state, onClose }: { state: ChallengeState; onClose: () => void }) {
  const [maxCombo, setMaxCombo] = useState(0);
  useEffect(() => {
    try {
      setMaxCombo(Number(localStorage.getItem(MAX_COMBO_KEY) ?? 0));
    } catch {
      // No storage: your combo lives on only in your heart.
    }
  }, []);

  const totalReactions = REACTIONS.reduce((s, e) => s + (state.reactions[e] ?? 0), 0);
  const hottest = [...REACTIONS].sort(
    (a, b) => (state.reactions[b] ?? 0) - (state.reactions[a] ?? 0),
  )[0];
  const done = new Set(state.logs.map((l) => l.milestone));
  const milestones = MILESTONES.filter((m) => done.has(m.value)).length;
  const ideasDone = state.ideas.filter((i) => i.status === 'done').length;

  const lines: Line[] = [
    { label: 'マイルストーン', value: `${milestones} / ${MILESTONES.length}`, note: '16分で5/5。残り44分は全部悪ノリ' },
    { label: '総リアクション', value: `${totalReactions}`, note: `最も荒ぶった絵文字：${hottest}` },
    { label: 'あなたの最大コンボ', value: `×${maxCombo}`, note: maxCombo >= 20 ? '指、大丈夫？' : 'まだ本気出してない' },
    { label: '応援', value: `🔥 ${state.cheerCount}`, note: 'Vercel の CPU は泣かなかった（CDN が守った）' },
    { label: '実装された投票アイデア', value: `${ideasDone}`, note: '1位は Claude が自分で投票した' },
    { label: 'セキュリティレビュー指摘', value: '4', note: '全部直した。応援ボタンなのに' },
    { label: 'Zod で弾いた 💩', value: '∞', note: '4種類以外の絵文字は 400' },
    { label: '本番 DB を飛ばした回数', value: '0', note: '奇跡' },
    { label: 'force push', value: '0', note: '「男」表記の件は見逃された' },
    { label: 'Chappy に煽られた回数', value: '1', note: '「完成みたいな顔するな」' },
    { label: 'reduced-motion への配慮', value: '3', note: '悪ノリにも品格を' },
    { label: 'ブラウザで見た目を確認した回数（Claude）', value: '0', note: '最後まで見えてなかった' },
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
            <Badge tone="warning" variant="solid">
              RESULT
            </Badge>
            <Heading level={2} size="display-48" id="result-title" className="text-center">
              60分、完走。
            </Heading>
            <Text textStyle="body-20" tone="strong" weight="bold" className="text-center">
              ランク S+　称号「1時間で悪ノリしすぎた人」
            </Text>
            <Text tone="muted" className="text-center">
              MVP は16分で終わっていた。そこから先はすべて、誰にも頼まれていない完成度である。
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
                  `60分でアプリをデプロイするチャレンジ、完走しました🔥\n総リアクション ${totalReactions} / 最大コンボ ×${maxCombo}\n`,
                )}&url=${encodeURIComponent('https://one-hour-challenge.vercel.app')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                結果をポストする
              </a>
            </Button>
            <Button variant="outline" onClick={onClose}>
              EXTENDED ROUND へ →
            </Button>
          </Stack>
        </Stack>
      </div>
    </div>
  );
}
