'use client';

import type { ReactNode } from 'react';
import { SegmentGroup as ArkSegmentGroup } from '@ark-ui/react';
import { tv } from '../../tv';
import { focusRingWithin } from '../../variants';

// A radio group drawn as a segmented control: Ark owns the radio roles,
// the hidden inputs and the indicator's --left / --width position.
const segmentGroupStyles = tv({
  slots: {
    root: 'relative inline-flex rounded-control base-bg-muted p-1',
    label: 'sr-only',
    indicator: [
      'top-(--top) left-(--left) h-(--height) w-(--width) rounded-control base-bg shadow-flat',
      '[--transition-duration:var(--duration-transition)] [--transition-timing-function:var(--ease-standard)]',
    ],
    item: [
      'relative z-docked inline-flex cursor-pointer items-center justify-center px-3 py-1.5 text-oneline-14 font-medium base-fg-muted transition-colors',
      'ark-checked:base-fg-strong',
      'ark-disabled:cursor-not-allowed ark-disabled:opacity-50',
      focusRingWithin(),
    ],
    itemText: '',
  },
});

const styles = segmentGroupStyles();

export type SegmentGroupOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type SegmentGroupProps = ArkSegmentGroup.RootProps & {
  options: SegmentGroupOption[];
  // Names the group for assistive technology; visually hidden.
  label: ReactNode;
};

export const SegmentGroup = ({
  options,
  label,
  className,
  ...props
}: SegmentGroupProps) => (
  <ArkSegmentGroup.Root className={styles.root({ className })} {...props}>
    <ArkSegmentGroup.Label className={styles.label()}>
      {label}
    </ArkSegmentGroup.Label>
    <ArkSegmentGroup.Indicator className={styles.indicator()} />
    {options.map((option) => (
      <ArkSegmentGroup.Item
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        className={styles.item()}
      >
        <ArkSegmentGroup.ItemText className={styles.itemText()}>
          {option.label}
        </ArkSegmentGroup.ItemText>
        <ArkSegmentGroup.ItemHiddenInput />
      </ArkSegmentGroup.Item>
    ))}
  </ArkSegmentGroup.Root>
);
