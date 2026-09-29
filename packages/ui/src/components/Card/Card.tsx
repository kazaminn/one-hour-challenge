'use client';

import type { ComponentPropsWithoutRef, HTMLAttributes } from 'react';
import { ark } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';

const cardStyles = tv({
  slots: {
    root: 'flex flex-col rounded-surface border text-inherit no-underline',
    header: 'flex flex-col gap-1 px-5 pt-5',
    title: 'text-body-18 font-semibold base-fg-strong',
    description: 'text-dense-14 base-fg-muted',
    body: 'px-5 py-5 text-body-16 base-fg',
    footer: 'flex items-center gap-3 px-5 pb-5',
  },
  variants: {
    variant: {
      outline: { root: 'base-border-muted base-bg' },
      subtle: { root: 'border-transparent base-bg-subtle' },
      elevated: { root: 'border-transparent base-bg shadow-raised' },
    },
    interactive: {
      true: {
        root: [
          'transition hover:-translate-y-px hover:primary-border-muted hover:shadow-raised',
          focusRing(),
        ],
      },
    },
  },
  defaultVariants: { variant: 'outline' },
});

// Typed against HTMLElement so the same props fit the <a> and the <div>.
type CardRootProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof cardStyles> & {
    // For a router Link, use `asChild`.
    href?: string;
    asChild?: boolean;
  };

export const CardRoot = ({
  variant,
  interactive,
  href,
  asChild,
  className,
  ...props
}: CardRootProps) => {
  const styles = cardStyles({
    variant,
    interactive: interactive ?? href !== undefined,
  });
  const rootClassName = styles.root({ className });

  if (href !== undefined) {
    return <ark.a href={href} className={rootClassName} {...props} />;
  }
  return <ark.div asChild={asChild} className={rootClassName} {...props} />;
};

const styles = cardStyles();

export const CardHeader = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={styles.header({ className })} {...props} />
);

// An h3 by default; `asChild` swaps in the heading level the page needs.
export const CardTitle = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ark.h3>) => (
  <ark.h3 className={styles.title({ className })} {...props} />
);

export const CardDescription = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) => (
  <p className={styles.description({ className })} {...props} />
);

export const CardBody = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={styles.body({ className })} {...props} />
);

export const CardFooter = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={styles.footer({ className })} {...props} />
);
