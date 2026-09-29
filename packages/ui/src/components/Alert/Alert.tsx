'use client';

import type { ComponentPropsWithoutRef, ComponentPropsWithRef } from 'react';
import {
  CircleAlert,
  CircleCheck,
  Info,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { tv, type VariantProps } from '../../tv';

// Every part inherits its color from Root, so the status only has to be
// set once; the roles come from the design token status colors.
const alertStyles = tv({
  slots: {
    root: 'flex gap-3 rounded-surface border p-4 text-body-16',
    indicator: 'mt-0.5 inline-flex shrink-0 [&>svg]:size-5',
    content: 'flex min-w-0 flex-1 flex-col gap-1',
    title: 'font-bold',
    description: '',
  },
  variants: {
    status: {
      neutral: { root: 'base-border-muted base-bg-subtle base-fg' },
      info: { root: 'info-border-muted info-bg info-fg' },
      success: { root: 'success-border-muted success-bg success-fg' },
      warning: { root: 'warning-border-muted warning-bg warning-fg' },
      error: { root: 'error-border-muted error-bg error-fg' },
    },
    variant: {
      subtle: {},
      solid: {},
    },
  },
  compoundVariants: [
    {
      status: 'neutral',
      variant: 'solid',
      class: { root: 'base-border-solid base-bg-solid base-fg-contrast' },
    },
    {
      status: 'info',
      variant: 'solid',
      class: { root: 'info-border-solid info-bg-solid info-fg-contrast' },
    },
    {
      status: 'success',
      variant: 'solid',
      class: {
        root: 'success-border-solid success-bg-solid success-fg-contrast',
      },
    },
    {
      status: 'warning',
      variant: 'solid',
      class: {
        root: 'warning-border-solid warning-bg-solid warning-fg-contrast',
      },
    },
    {
      status: 'error',
      variant: 'solid',
      class: { root: 'error-border-solid error-bg-solid error-fg-contrast' },
    },
  ],
  defaultVariants: { status: 'neutral', variant: 'subtle' },
});

type AlertVariants = VariantProps<typeof alertStyles>;
type AlertStatus = NonNullable<AlertVariants['status']>;

const statusIcons: Record<AlertStatus, LucideIcon> = {
  neutral: Info,
  info: CircleAlert,
  success: CircleCheck,
  warning: TriangleAlert,
  error: OctagonAlert,
};

const styles = alertStyles();

type AlertRootProps = ComponentPropsWithRef<'div'> &
  AlertVariants & {
    // How a message that appears later is announced: `polite` waits for a
    // pause (aria-live), `assertive` interrupts (role="alert"). A static
    // alert on the page keeps neither, so it is not re-announced on load.
    live?: 'polite' | 'assertive';
  };

export const AlertRoot = ({
  status,
  variant,
  live,
  className,
  ...props
}: AlertRootProps) => (
  <div
    role={live === 'assertive' ? 'alert' : undefined}
    aria-live={live === 'polite' ? 'polite' : undefined}
    aria-atomic={live === 'polite' ? true : undefined}
    className={alertStyles({ status, variant }).root({ className })}
    {...props}
  />
);

type AlertIndicatorProps = ComponentPropsWithoutRef<'span'> & {
  status?: AlertStatus;
};

export const AlertIndicator = ({
  status = 'neutral',
  className,
  children,
  ...props
}: AlertIndicatorProps) => {
  const DefaultIcon = statusIcons[status];
  return (
    <span
      aria-hidden="true"
      className={styles.indicator({ className })}
      {...props}
    >
      {children ?? <DefaultIcon aria-hidden="true" />}
    </span>
  );
};

export const AlertContent = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={styles.content({ className })} {...props} />
);

export const AlertTitle = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) => (
  <p className={styles.title({ className })} {...props} />
);

export const AlertDescription = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={styles.description({ className })} {...props} />
);
