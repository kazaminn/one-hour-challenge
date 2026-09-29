'use client';

import type { ComponentPropsWithRef } from 'react';
import { ark } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';

export const buttonStyles = tv({
  extend: focusRing,
  base: [
    'inline-flex items-center justify-center gap-2',
    'rounded-control font-medium transition-colors',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary: ['primary-bg-solid primary-fg-contrast', 'hover:opacity-90'],
      outline: [
        'border base-border-solid base-fg-strong',
        'hover:base-bg-subtle',
      ],
      ghost: ['base-fg-strong', 'hover:base-bg-subtle'],
      link: ['link-fg underline underline-offset-2', 'hover:link-fg-strong'],
    },
    size: {
      sm: 'h-8 px-3 text-oneline-14',
      md: 'h-10 px-4 text-oneline-16',
      lg: 'h-12 px-6 text-oneline-16',
    },
  },
  compoundVariants: [
    // link reads as inline text, so it drops the box padding and height
    { variant: 'link', class: 'h-auto px-0' },
  ],
  defaultVariants: { variant: 'primary', size: 'md' },
});

// `asChild` hands the styles and props to the single child instead of
// rendering a <button>, so a router Link can look like a button.
type ButtonProps = ComponentPropsWithRef<typeof ark.button> &
  VariantProps<typeof buttonStyles>;

export const Button = ({
  variant,
  size,
  type,
  asChild,
  className,
  ...props
}: ButtonProps) => (
  <ark.button
    asChild={asChild}
    // A native button defaults to type="button" so it never submits by
    // accident; a child element keeps its own attributes.
    type={asChild === true ? type : (type ?? 'button')}
    className={buttonStyles({ variant, size, className })}
    {...props}
  />
);
