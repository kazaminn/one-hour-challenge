'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { ark } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { gapVariants } from '../../variants';

export const inlineStyles = tv({
  base: 'flex flex-wrap',
  variants: {
    gap: gapVariants,
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    },
  },
  defaultVariants: { gap: 2, align: 'center' },
});

type InlineProps = ComponentPropsWithoutRef<typeof ark.div> &
  VariantProps<typeof inlineStyles>;

export const Inline = ({
  gap,
  align,
  justify,
  className,
  ...props
}: InlineProps) => (
  <ark.div
    className={inlineStyles({ gap, align, justify, className })}
    {...props}
  />
);
