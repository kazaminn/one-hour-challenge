'use client';

import type { ReactNode } from 'react';
import { ToggleGroup as ArkToggleGroup } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';

// Ark owns the pressed state, roving focus and aria semantics.
const toggleGroupStyles = tv({
  slots: {
    root: 'inline-flex',
    item: [
      'inline-flex h-10 items-center justify-center gap-2 px-3 text-oneline-14 font-medium base-fg transition-colors',
      'hover:base-bg-subtle',
      'ark-on:primary-bg-muted ark-on:primary-fg',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      focusRing(),
    ],
  },
  variants: {
    variant: {
      // one framed strip, the items sharing borders
      attached: {
        root: 'rounded-control border base-border-solid',
        item: [
          'base-border-solid not-first:border-s',
          'first:rounded-s-control last:rounded-e-control',
        ],
      },
      separate: {
        root: 'gap-1',
        item: 'rounded-control border base-border-solid',
      },
    },
  },
  defaultVariants: { variant: 'attached' },
});

export type ToggleGroupItem = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type ToggleGroupProps = ArkToggleGroup.RootProps &
  VariantProps<typeof toggleGroupStyles> & {
    items: ToggleGroupItem[];
  };

export const ToggleGroup = ({
  items,
  variant,
  className,
  ...props
}: ToggleGroupProps) => {
  const styles = toggleGroupStyles({ variant });
  return (
    <ArkToggleGroup.Root className={styles.root({ className })} {...props}>
      {items.map((item) => (
        <ArkToggleGroup.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className={styles.item()}
        >
          {item.label}
        </ArkToggleGroup.Item>
      ))}
    </ArkToggleGroup.Root>
  );
};
