'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv, type VariantProps } from '../../tv';

const skeletonStyles = tv({
  base: 'animate-pulse base-bg-muted motion-reduce:animate-none',
  variants: {
    shape: {
      rect: 'rounded-control',
      circle: 'rounded-pill',
      // one line of text; width comes from className
      text: 'h-4 w-full rounded-tight',
    },
  },
  defaultVariants: { shape: 'rect' },
});

type SkeletonProps = ComponentPropsWithoutRef<'div'> &
  VariantProps<typeof skeletonStyles> & {
    loading?: boolean;
  };

// Decorative: assistive technology should hear a Spinner or a live region
// instead, so the placeholder itself is hidden.
export const Skeleton = ({
  shape,
  loading = true,
  className,
  children,
  ...props
}: SkeletonProps) => {
  if (!loading) return children;
  return (
    <div
      aria-hidden="true"
      className={skeletonStyles({ shape, className })}
      {...props}
    />
  );
};
