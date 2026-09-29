'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv, type VariantProps } from '../../tv';

const separatorStyles = tv({
  base: 'border-0 base-border-muted',
  variants: {
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-auto self-stretch border-l',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

type SeparatorProps = ComponentPropsWithoutRef<'hr'> &
  VariantProps<typeof separatorStyles>;

// An <hr> carries the separator role itself; only the vertical case needs
// aria-orientation, since horizontal is the default.
export const Separator = ({
  orientation = 'horizontal',
  className,
  ...props
}: SeparatorProps) => (
  <hr
    aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
    className={separatorStyles({ orientation, className })}
    {...props}
  />
);
