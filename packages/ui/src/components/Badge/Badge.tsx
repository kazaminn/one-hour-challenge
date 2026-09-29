'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv, type VariantProps } from '../../tv';

// tone × variant is spelled out so every class is a literal Tailwind can
// find; each pair is one the token package guarantees for contrast.
const badgeStyles = tv({
  base: 'inline-flex items-center gap-1 rounded-pill font-medium whitespace-nowrap',
  variants: {
    tone: {
      base: '',
      primary: '',
      secondary: '',
      info: '',
      success: '',
      warning: '',
      error: '',
    },
    variant: {
      subtle: '',
      solid: '',
      outline: 'border',
    },
    size: {
      sm: 'h-5 px-1.5 text-oneline-14',
      md: 'h-6 px-2 text-oneline-14',
    },
  },
  compoundVariants: [
    { tone: 'base', variant: 'subtle', class: 'base-bg-muted base-fg' },
    { tone: 'base', variant: 'solid', class: 'base-bg-solid base-fg-contrast' },
    { tone: 'base', variant: 'outline', class: 'base-border-solid base-fg' },
    {
      tone: 'primary',
      variant: 'subtle',
      class: 'primary-bg-muted primary-fg',
    },
    {
      tone: 'primary',
      variant: 'solid',
      class: 'primary-bg-solid primary-fg-contrast',
    },
    {
      tone: 'primary',
      variant: 'outline',
      class: 'primary-border-solid primary-fg',
    },
    {
      tone: 'secondary',
      variant: 'subtle',
      class: 'secondary-bg-muted secondary-fg',
    },
    {
      tone: 'secondary',
      variant: 'solid',
      class: 'secondary-bg-solid secondary-fg-contrast',
    },
    {
      tone: 'secondary',
      variant: 'outline',
      class: 'secondary-border-solid secondary-fg',
    },
    { tone: 'info', variant: 'subtle', class: 'info-bg-muted info-fg' },
    { tone: 'info', variant: 'solid', class: 'info-bg-solid info-fg-contrast' },
    { tone: 'info', variant: 'outline', class: 'info-border-solid info-fg' },
    {
      tone: 'success',
      variant: 'subtle',
      class: 'success-bg-muted success-fg',
    },
    {
      tone: 'success',
      variant: 'solid',
      class: 'success-bg-solid success-fg-contrast',
    },
    {
      tone: 'success',
      variant: 'outline',
      class: 'success-border-solid success-fg',
    },
    {
      tone: 'warning',
      variant: 'subtle',
      class: 'warning-bg-muted warning-fg',
    },
    {
      tone: 'warning',
      variant: 'solid',
      class: 'warning-bg-solid warning-fg-contrast',
    },
    {
      tone: 'warning',
      variant: 'outline',
      class: 'warning-border-solid warning-fg',
    },
    { tone: 'error', variant: 'subtle', class: 'error-bg-muted error-fg' },
    {
      tone: 'error',
      variant: 'solid',
      class: 'error-bg-solid error-fg-contrast',
    },
    { tone: 'error', variant: 'outline', class: 'error-border-solid error-fg' },
  ],
  defaultVariants: { tone: 'base', variant: 'subtle', size: 'md' },
});

type BadgeProps = ComponentPropsWithoutRef<'span'> &
  VariantProps<typeof badgeStyles>;

export const Badge = ({
  tone,
  variant,
  size,
  className,
  ...props
}: BadgeProps) => (
  <span
    className={badgeStyles({ tone, variant, size, className })}
    {...props}
  />
);
