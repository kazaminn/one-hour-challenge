'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv, type VariantProps } from '../../tv';
import { VisuallyHidden } from '../VisuallyHidden';

const spinnerStyles = tv({
  base: [
    'inline-block shrink-0 animate-spin rounded-pill border-2 motion-reduce:animate-none',
    'border-(--r-base-border-muted) border-t-(--r-primary-bg-solid)',
  ],
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-6',
      lg: 'size-8',
    },
  },
  defaultVariants: { size: 'md' },
});

type SpinnerVariants = VariantProps<typeof spinnerStyles>;

type SpinnerProps =
  // <output> carries the status role, so the label is announced politely.
  // Use this default whenever the spinner is the only signal that
  // something is happening.
  | (ComponentPropsWithoutRef<'output'> &
      SpinnerVariants & {
        decorative?: false;
        label?: string;
      })
  // A caller that already announces the loading state itself (Button's own
  // text, a Toast that owns its status) renders the spinner as a plain,
  // hidden-from-AT glyph instead of a second live region.
  | (ComponentPropsWithoutRef<'span'> &
      SpinnerVariants & {
        decorative: true;
        label?: never;
      });

export const Spinner = (props: SpinnerProps) => {
  if (props.decorative === true) {
    const {
      decorative: _decorative,
      label: _label,
      size,
      className,
      ...spanProps
    } = props;
    return (
      <span
        aria-hidden="true"
        className={spinnerStyles({ size, className })}
        {...spanProps}
      />
    );
  }
  const {
    decorative: _decorative,
    label = '読み込み中',
    size,
    className,
    ...outputProps
  } = props;
  return (
    <output className={spinnerStyles({ size, className })} {...outputProps}>
      <VisuallyHidden>{label}</VisuallyHidden>
    </output>
  );
};
