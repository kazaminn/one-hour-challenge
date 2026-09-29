'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv, type VariantProps } from '../../tv';

const codeStyles = tv({
  base: 'rounded-tight px-1.5 py-0.5 font-mono text-mono-14 base-fg-strong',
  variants: {
    variant: {
      subtle: 'base-bg-muted',
      outline: 'border base-border-muted',
    },
  },
  defaultVariants: { variant: 'subtle' },
});

type CodeProps = ComponentPropsWithoutRef<'code'> &
  VariantProps<typeof codeStyles>;

// Inline code inside running text; blocks of code go to CodeBlock.
export const Code = ({ variant, className, ...props }: CodeProps) => (
  <code className={codeStyles({ variant, className })} {...props} />
);
