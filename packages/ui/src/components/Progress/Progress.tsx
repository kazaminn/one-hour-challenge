'use client';

import { Progress as ArkProgress } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';

// Ark owns the progressbar role, aria-valuenow / min / max, the value text
// live region and the range width; these parts only style them. Ark names
// the bar after its value, so the label is handed to the track as its name.
const progressStyles = tv({
  slots: {
    root: 'flex w-full flex-col gap-1.5',
    header: 'flex items-baseline justify-between gap-3',
    label: 'text-dense-14 font-medium base-fg-strong',
    valueText: 'font-mono text-mono-14 base-fg-muted',
    track: 'w-full overflow-hidden rounded-pill base-bg-muted',
    range: [
      'h-full rounded-pill transition-[width] duration-transition ease-standard',
      // no value: a pulsing full bar stands in for the unknown amount
      'ark-indeterminate:w-full ark-indeterminate:animate-pulse',
    ],
  },
  variants: {
    size: {
      sm: { track: 'h-1' },
      md: { track: 'h-2' },
      lg: { track: 'h-3' },
    },
    tone: {
      primary: { range: 'primary-bg-solid' },
      success: { range: 'success-bg-solid' },
      warning: { range: 'warning-bg-solid' },
      error: { range: 'error-bg-solid' },
    },
  },
  defaultVariants: { size: 'md', tone: 'primary' },
});

type ProgressProps = ArkProgress.RootProps &
  VariantProps<typeof progressStyles> & {
    label?: string;
    showValueText?: boolean;
  };

export const Progress = ({
  label,
  showValueText = false,
  size,
  tone,
  className,
  ...props
}: ProgressProps) => {
  const styles = progressStyles({ size, tone });
  return (
    <ArkProgress.Root className={styles.root({ className })} {...props}>
      {(label !== undefined || showValueText) && (
        <div className={styles.header()}>
          {label !== undefined && (
            <ArkProgress.Label className={styles.label()}>
              {label}
            </ArkProgress.Label>
          )}
          {showValueText && (
            <ArkProgress.ValueText className={styles.valueText()} />
          )}
        </div>
      )}
      <ArkProgress.Track aria-label={label} className={styles.track()}>
        <ArkProgress.Range className={styles.range()} />
      </ArkProgress.Track>
    </ArkProgress.Root>
  );
};
