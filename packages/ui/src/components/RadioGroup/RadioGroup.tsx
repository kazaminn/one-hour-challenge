'use client';

import type { ReactNode } from 'react';
import { RadioGroup as ArkRadioGroup } from '@ark-ui/react';
import { tv } from '../../tv';
import { focusRingWithin } from '../../variants';

const radioGroupStyles = tv({
  slots: {
    root: 'flex flex-col gap-2',
    label: 'text-dense-14 font-medium base-fg-strong',
    item: [
      'inline-flex items-center gap-2',
      'ark-disabled:cursor-not-allowed ark-disabled:opacity-50',
    ],
    // The dot is the background showing through a thick border, the way
    // Ark's own example draws it, so no pseudo-element is needed.
    itemControl: [
      'size-5 shrink-0 rounded-pill border base-border-solid base-bg transition-colors',
      'ark-checked:border-5 ark-checked:primary-border-solid',
      focusRingWithin(),
    ],
    itemText: 'text-body-16 base-fg-strong',
  },
});

const styles = radioGroupStyles();

type RadioOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

type RadioGroupProps = ArkRadioGroup.RootProps & {
  options: RadioOption[];
  label?: ReactNode;
};

export const RadioGroup = ({
  options,
  label,
  className,
  ...props
}: RadioGroupProps) => (
  <ArkRadioGroup.Root className={styles.root({ className })} {...props}>
    {label !== undefined && (
      <ArkRadioGroup.Label className={styles.label()}>
        {label}
      </ArkRadioGroup.Label>
    )}
    {options.map((option) => (
      <ArkRadioGroup.Item
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        className={styles.item()}
      >
        <ArkRadioGroup.ItemControl className={styles.itemControl()} />
        <ArkRadioGroup.ItemText className={styles.itemText()}>
          {option.label}
        </ArkRadioGroup.ItemText>
        <ArkRadioGroup.ItemHiddenInput />
      </ArkRadioGroup.Item>
    ))}
  </ArkRadioGroup.Root>
);
