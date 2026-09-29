'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { ark } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';
import { VisuallyHidden } from '../VisuallyHidden';

export const linkStyles = tv({
  extend: focusRing,
  base: 'rounded-tight link-fg underline-offset-2 transition-colors hover:link-fg-strong',
  variants: {
    variant: {
      underline: 'underline',
      plain: 'no-underline hover:underline',
    },
  },
  defaultVariants: { variant: 'underline' },
});

type LinkProps = ComponentPropsWithoutRef<typeof ark.a> &
  VariantProps<typeof linkStyles> &
  (
    | {
        external?: boolean;
        asChild?: false;
      }
    | { external?: false; asChild: true }
  );

// A plain <a>; `asChild` hands the styles (and the external target) to a
// router Link, whose single child has to stay untouched — so the spoken
// note is only added to the plain anchor.
export const Link = ({
  variant,
  external = false,
  asChild,
  className,
  children,
  ...props
}: LinkProps) => (
  <ark.a
    asChild={asChild}
    className={linkStyles({ variant, className })}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
    {...props}
  >
    {asChild === true ? (
      children
    ) : (
      <>
        {children}
        {external && <VisuallyHidden>（新しいタブで開きます）</VisuallyHidden>}
      </>
    )}
  </ark.a>
);
