'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { tv, type VariantProps } from '../../tv';
import { VisuallyHidden } from '../VisuallyHidden';

// A labelled figure: <dl> keeps the label and the value paired for
// assistive technology, and the trend says its direction in words too.
const statStyles = tv({
  slots: {
    root: 'flex flex-col gap-1',
    label: 'text-dense-14 base-fg-muted',
    valueText: 'text-highlight-28 font-bold base-fg-strong tabular-nums',
    helpText: 'text-dense-14 base-fg-muted',
    indicator:
      'inline-flex items-center gap-1 text-dense-14 font-medium [&>svg]:size-4',
  },
  variants: {
    trend: {
      up: { indicator: 'success-fg' },
      down: { indicator: 'error-fg' },
    },
  },
});

const styles = statStyles();

export const StatRoot = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'dl'>) => (
  <dl className={styles.root({ className })} {...props} />
);

export const StatLabel = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'dt'>) => (
  <dt className={styles.label({ className })} {...props} />
);

export const StatValueText = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'dd'>) => (
  <dd className={styles.valueText({ className })} {...props} />
);

export const StatHelpText = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'dd'>) => (
  <dd className={styles.helpText({ className })} {...props} />
);

type StatIndicatorProps = ComponentPropsWithoutRef<'span'> &
  Required<VariantProps<typeof statStyles>>;

export const StatIndicator = ({
  trend,
  className,
  children,
  ...props
}: StatIndicatorProps) => {
  const Icon = trend === 'up' ? TrendingUp : TrendingDown;
  return (
    <span className={statStyles({ trend }).indicator({ className })} {...props}>
      <Icon aria-hidden="true" />
      <VisuallyHidden>{trend === 'up' ? '増加' : '減少'}</VisuallyHidden>
      {children}
    </span>
  );
};
