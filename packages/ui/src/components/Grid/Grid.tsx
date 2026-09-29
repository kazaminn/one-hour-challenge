'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { ark } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { gapVariants } from '../../variants';

export const gridStyles = tv({
  base: 'grid',
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      // as many columns as fit, each at least --grid-min (16rem) wide;
      // override with `[--grid-min:12rem]` on className
      auto: 'grid-cols-[repeat(auto-fill,minmax(var(--grid-min,16rem),1fr))]',
    },
    gap: gapVariants,
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
  },
  defaultVariants: { columns: 'auto', gap: 4 },
});

type GridProps = ComponentPropsWithoutRef<typeof ark.div> &
  VariantProps<typeof gridStyles>;

export const Grid = ({
  columns,
  gap,
  align,
  className,
  ...props
}: GridProps) => (
  <ark.div
    className={gridStyles({ columns, gap, align, className })}
    {...props}
  />
);
