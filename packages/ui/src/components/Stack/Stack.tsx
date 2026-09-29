'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { ark } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { gapVariants } from '../../variants';

export const stackStyles = tv({
  base: 'flex',
  variants: {
    direction: {
      column: 'flex-col',
      row: 'flex-row',
    },
    gap: gapVariants,
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
    wrap: {
      true: 'flex-wrap',
    },
  },
  defaultVariants: { direction: 'column', gap: 4 },
});

type StackProps = ComponentPropsWithoutRef<typeof ark.div> &
  VariantProps<typeof stackStyles>;

// A flex column by default; `asChild` puts the layout on a ul, section…
export const Stack = ({
  direction,
  gap,
  align,
  justify,
  wrap,
  className,
  ...props
}: StackProps) => (
  <ark.div
    className={stackStyles({ direction, gap, align, justify, wrap, className })}
    {...props}
  />
);
