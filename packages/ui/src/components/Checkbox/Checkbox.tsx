'use client';

import type { ReactNode } from 'react';
import { Checkbox as ArkCheckbox } from '@ark-ui/react';
import { Check, Minus } from 'lucide-react';
import { tv } from '../../tv';
import { focusRingWithin } from '../../variants';

const checkboxStyles = tv({
  slots: {
    root: [
      'inline-flex items-center gap-2',
      'ark-disabled:cursor-not-allowed ark-disabled:opacity-50',
    ],
    control: [
      'grid size-5 shrink-0 place-items-center rounded-tight border base-border-solid',
      'primary-fg-contrast transition-colors',
      'ark-checked:primary-border-solid ark-checked:primary-bg-solid',
      'ark-indeterminate:primary-border-solid ark-indeterminate:primary-bg-solid',
      focusRingWithin(),
    ],
    // The icon fills the box; without an explicit size the svg would
    // overflow the 14px indicator and sit off-center.
    indicator: 'flex size-3.5 items-center justify-center [&>svg]:size-full',
    label: 'text-body-16 base-fg-strong',
  },
});

const styles = checkboxStyles();

// An accessible name is required — a visible `label`, or `aria-label`/
// `aria-labelledby` when the visible label lives elsewhere (e.g. DataTable's
// row-selection checkboxes).
type CheckboxProps = ArkCheckbox.RootProps &
  (
    | { label: ReactNode }
    | { label?: undefined; 'aria-label': string }
    | { label?: undefined; 'aria-labelledby': string }
  );

export const Checkbox = ({ label, className, ...props }: CheckboxProps) => (
  <ArkCheckbox.Root className={styles.root({ className })} {...props}>
    <ArkCheckbox.Control className={styles.control()}>
      <ArkCheckbox.Indicator className={styles.indicator()}>
        <Check aria-hidden="true" />
      </ArkCheckbox.Indicator>
      <ArkCheckbox.Indicator indeterminate className={styles.indicator()}>
        <Minus aria-hidden="true" />
      </ArkCheckbox.Indicator>
    </ArkCheckbox.Control>
    {label !== undefined && (
      <ArkCheckbox.Label className={styles.label()}>{label}</ArkCheckbox.Label>
    )}
    <ArkCheckbox.HiddenInput />
  </ArkCheckbox.Root>
);
