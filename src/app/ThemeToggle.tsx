'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@kazamitte/kazamitte-ui';
import { THEME_KEY } from './theme';

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => setDark(document.documentElement.dataset.mode === 'dark'), []);

  function toggle() {
    const next = !dark;
    document.documentElement.dataset.mode = next ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch {
      // Not remembered, but the switch still works for this visit.
    }
    setDark(next);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-pressed={dark ?? undefined}
      aria-label="ダークモード"
    >
      {dark ? <Sun aria-hidden size={16} /> : <Moon aria-hidden size={16} />}
    </Button>
  );
}
