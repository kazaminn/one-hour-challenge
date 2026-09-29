'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { ark } from '@ark-ui/react';
import { ChevronRight } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

const breadcrumbsStyles = tv({
  slots: {
    root: 'font-mono text-mono-14 base-fg-muted',
    list: 'm-0 flex list-none flex-wrap items-center gap-2 p-0',
    item: 'flex items-center gap-2',
    link: [
      'rounded-tight base-fg-muted no-underline hover:base-fg hover:underline',
      focusRing(),
    ],
    currentLink: 'base-fg',
    separator: 'inline-flex base-fg-muted [&>svg]:size-4',
  },
});

const styles = breadcrumbsStyles();

export const BreadcrumbsRoot = ({
  'aria-label': ariaLabel = '現在位置',
  className,
  ...props
}: ComponentPropsWithoutRef<'nav'>) => (
  <nav
    aria-label={ariaLabel}
    className={styles.root({ className })}
    {...props}
  />
);

export const BreadcrumbsList = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'ol'>) => (
  <ol className={styles.list({ className })} {...props} />
);

export const BreadcrumbsItem = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'li'>) => (
  <li className={styles.item({ className })} {...props} />
);

// A plain <a>; `asChild` hands the styles to a router Link.
export const BreadcrumbsLink = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ark.a>) => (
  <ark.a className={styles.link({ className })} {...props} />
);

export const BreadcrumbsCurrentLink = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'span'>) => (
  <span
    aria-current="page"
    className={styles.currentLink({ className })}
    {...props}
  />
);

// Decorative; a chevron unless children say otherwise.
export const BreadcrumbsSeparator = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<'span'>) => (
  <span
    aria-hidden="true"
    className={styles.separator({ className })}
    {...props}
  >
    {children ?? <ChevronRight />}
  </span>
);
