'use client';

import { useRef, useState } from 'react';

const SETTLE_MS = 600;
const MAX_PER_REQUEST = 20;
export const MAX_COMBO_KEY = 'max-combo';

/**
 * Lets a button be mashed: every tap counts instantly (combo + pending),
 * and once tapping pauses for SETTLE_MS the taps go out as one request.
 * Server load stays one request per burst, however fast the finger.
 */
export function useMash(send: (times: number) => Promise<void>) {
  const [pending, setPending] = useState(0);
  const [combo, setCombo] = useState(0);
  const pendingRef = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function tap() {
    pendingRef.current += 1;
    setPending(pendingRef.current);
    setCombo((c) => {
      const next = c + 1;
      try {
        if (next > Number(localStorage.getItem(MAX_COMBO_KEY) ?? 0)) {
          localStorage.setItem(MAX_COMBO_KEY, String(next));
        }
      } catch {
        // Max combo is just for the result screen's bragging rights.
      }
      return next;
    });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const times = Math.min(pendingRef.current, MAX_PER_REQUEST);
      pendingRef.current = 0;
      setCombo(0);
      void send(times).finally(() => setPending(0));
    }, SETTLE_MS);
  }

  return { tap, pending, combo };
}
