'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';
import { VisuallyHidden } from '../VisuallyHidden';

// A removable token, e.g. an applied filter. Selection belongs to
// ToggleGroup; a static label is a Badge.
const chipStyles = tv({
  slots: {
    root: 'inline-flex h-7 items-center gap-1 rounded-pill ps-2.5 text-oneline-14 font-medium base-fg-strong',
    removeTrigger: [
      'inline-flex size-6 shrink-0 items-center justify-center rounded-pill base-fg-muted',
      'hover:base-bg-selected hover:base-fg-strong',
      focusRing(),
      '[&>svg]:size-3.5',
    ],
  },
  variants: {
    variant: {
      subtle: { root: 'base-bg-muted' },
      outline: { root: 'border base-border-solid' },
    },
    removable: {
      true: { root: 'pe-0.5' },
      false: { root: 'pe-2.5' },
    },
  },
  defaultVariants: { variant: 'subtle', removable: false },
});

type ChipProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> &
  VariantProps<typeof chipStyles> & {
    children: ReactNode;
    onRemove?: () => void;
    label?: string;
  };

export const Chip = ({
  variant,
  onRemove,
  label,
  className,
  children,
  ...props
}: ChipProps) => {
  const removable = onRemove !== undefined;
  const styles = chipStyles({ variant, removable });
  const spoken = label ?? (typeof children === 'string' ? children : '');
  return (
    <span className={styles.root({ className })} {...props}>
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={styles.removeTrigger()}
        >
          <X aria-hidden="true" />
          <VisuallyHidden>{spoken}を削除</VisuallyHidden>
        </button>
      )}
    </span>
  );
};
