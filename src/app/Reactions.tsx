'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Stack } from '@kazamitte/kazamitte-ui';
import { REACTIONS, type ChallengeState, type Reaction } from '@/lib/challenge';
import { toaster } from './toaster';
import { useMash } from './useMash';

type Floater = { id: number; emoji: Reaction; left: number };

const FLOAT_MS = 2600;
let nextId = 0;

function prefersReducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Emoji buttons plus a layer where everyone's reactions float up.
 * Other viewers' reactions arrive via polling: whenever a count rises above
 * the highest value seen so far, that many emoji are spawned (capped).
 * Tracking the max (not the previous value) avoids double-spawning when a
 * stale CDN response briefly reports a lower count.
 */
export function Reactions({
  reactions,
  onUpdated,
}: {
  reactions: ChallengeState['reactions'];
  onUpdated: (state: ChallengeState) => void;
}) {
  const seen = useRef<Partial<Record<Reaction, number>> | null>(null);
  const [floaters, setFloaters] = useState<Floater[]>([]);

  useEffect(() => {
    if (seen.current == null) {
      seen.current = { ...reactions };
      return;
    }
    const reduced = prefersReducedMotion();
    const spawned: Floater[] = [];
    for (const emoji of REACTIONS) {
      const now = reactions[emoji] ?? 0;
      const before = seen.current[emoji] ?? 0;
      if (now <= before) continue;
      seen.current[emoji] = now;
      // Reduced motion: at most one quiet fade per emoji; otherwise a small burst.
      const n = Math.min(now - before, reduced ? 1 : 6);
      for (let i = 0; i < n; i++) {
        spawned.push({ id: nextId++, emoji, left: 10 + Math.random() * 80 });
      }
    }
    show(spawned);
  }, [reactions]);

  function show(spawned: Floater[]) {
    if (spawned.length === 0) return;
    setFloaters((f) => [...f, ...spawned].slice(-30));
    const ids = new Set(spawned.map((s) => s.id));
    setTimeout(() => setFloaters((f) => f.filter((x) => !ids.has(x.id))), FLOAT_MS);
  }

  /** Own tap: float it right away and pre-count it so the echo from the server doesn't float again. */
  function localTap(emoji: Reaction) {
    if (seen.current) seen.current[emoji] = (seen.current[emoji] ?? 0) + 1;
    if (prefersReducedMotion() && floaters.length > 2) return;
    show([{ id: nextId++, emoji, left: 10 + Math.random() * 80 }]);
  }

  return (
    <>
      <Stack direction="row" gap={1} justify="center" wrap>
        {REACTIONS.map((emoji) => (
          <ReactionButton
            key={emoji}
            emoji={emoji}
            count={reactions[emoji] ?? 0}
            onTap={() => localTap(emoji)}
            onUpdated={onUpdated}
          />
        ))}
      </Stack>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-0">
        {floaters.map((f) => (
          <span
            key={f.id}
            className="reaction-floater absolute bottom-6 text-4xl"
            style={{ left: `${f.left}%` }}
          >
            {f.emoji}
          </span>
        ))}
      </div>
    </>
  );
}

function ReactionButton({
  emoji,
  count,
  onTap,
  onUpdated,
}: {
  emoji: Reaction;
  count: number;
  onTap: () => void;
  onUpdated: (state: ChallengeState) => void;
}) {
  const { tap, pending, combo } = useMash(async (times) => {
    try {
      const res = await fetch('/api/react', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ emoji, times }),
      });
      if (res.status === 429) {
        toaster.create({ title: 'リアクション多すぎ！ちょっと休憩', type: 'warning' });
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      onUpdated((await res.json()) as ChallengeState);
    } catch {
      toaster.create({ title: '送信に失敗しました', type: 'error' });
    }
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        tap();
        onTap();
      }}
      aria-label={`${emoji} を送る（${count + pending}）`}
    >
      <span aria-hidden>{emoji}</span>
      <span className="font-mono text-xs tabular-nums" aria-hidden>
        {combo > 1 ? `×${combo}` : count + pending}
      </span>
    </Button>
  );
}
