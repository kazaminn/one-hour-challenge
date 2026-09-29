'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv, type VariantProps } from '../../tv';

const blockquoteStyles = tv({
  slots: {
    root: 'border-s-3 base-border-selected ps-4 text-body-16 base-fg',
    content: '',
    caption: 'mt-2 text-dense-14 base-fg-muted',
  },
  variants: {
    variant: {
      plain: {},
      subtle: { root: 'rounded-e-surface base-bg-subtle py-3 pe-4' },
    },
  },
  defaultVariants: { variant: 'plain' },
});

type BlockquoteRootProps = ComponentPropsWithoutRef<'blockquote'> &
  VariantProps<typeof blockquoteStyles>;

export const BlockquoteRoot = ({
  variant,
  className,
  ...props
}: BlockquoteRootProps) => (
  <blockquote
    className={blockquoteStyles({ variant }).root({ className })}
    {...props}
  />
);

export const BlockquoteContent = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={blockquoteStyles().content({ className })} {...props} />
);

// The source of the quote; wrap a title in <cite> inside it.
export const BlockquoteCaption = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'footer'>) => (
  <footer className={blockquoteStyles().caption({ className })} {...props} />
);
