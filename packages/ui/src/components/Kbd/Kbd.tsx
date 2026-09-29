'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv } from '../../tv';

const kbdStyles = tv({
  base: [
    'inline-flex items-center rounded-tight border base-border-muted base-bg-muted px-1.5',
    'font-mono text-mono-14 base-fg-strong',
  ],
});

// One key per element; compose a chord as sibling Kbds.
export const Kbd = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'kbd'>) => (
  <kbd className={kbdStyles({ className })} {...props} />
);
