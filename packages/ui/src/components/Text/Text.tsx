'use client';

import type { ComponentPropsWithRef } from 'react';
import { ark } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';

// `textStyle` names the token utility, so the type scale stays the single
// source of sizes and line heights.
export const textStyles = tv({
  variants: {
    textStyle: {
      'body-20': 'text-body-20',
      'body-18': 'text-body-18',
      'body-16': 'text-body-16',
      'dense-18': 'text-dense-18',
      'dense-16': 'text-dense-16',
      'dense-14': 'text-dense-14',
      'oneline-18': 'text-oneline-18',
      'oneline-16': 'text-oneline-16',
      'oneline-14': 'text-oneline-14',
      'mono-18': 'font-mono text-mono-18',
      'mono-16': 'font-mono text-mono-16',
      'mono-14': 'font-mono text-mono-14',
    },
    tone: {
      strong: 'base-fg-strong',
      default: 'base-fg',
      muted: 'base-fg-muted',
    },
    weight: {
      regular: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
    },
    truncate: {
      true: 'truncate',
    },
  },
  defaultVariants: { textStyle: 'body-16', tone: 'default' },
});

type TextProps = ComponentPropsWithRef<typeof ark.p> &
  VariantProps<typeof textStyles>;

// A <p> by default; `asChild` moves the styles onto a span, label, li…
export const Text = ({
  textStyle,
  tone,
  weight,
  truncate,
  className,
  ...props
}: TextProps) => (
  <ark.p
    className={textStyles({ textStyle, tone, weight, truncate, className })}
    {...props}
  />
);
