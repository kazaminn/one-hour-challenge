'use client';

// Ark hands the segments over through a render-prop context, so the
// wrapper renders the whole control: a year / month / day field typed
// one segment at a time, with the locale from LocaleProvider.
import type { ReactNode } from 'react';
import { DateInput as ArkDateInput } from '@ark-ui/react/date-input';
import { tv } from '../../tv';
import { inputStyles } from '../Input';

const dateInputStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    control: 'flex flex-wrap items-center gap-2',
    segmentGroup: [
      inputStyles(),
      'flex w-auto min-w-0 flex-1 cursor-text items-center gap-px',
      'ark-focus:primary-border-solid',
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      'ark-readonly:base-bg-subtle',
    ],
    segment: [
      'inline-flex min-w-[2ch] items-center justify-center rounded-tight px-0.5 text-center tabular-nums [caret-color:transparent] outline-none',
      'ark-placeholder-shown:base-fg-muted',
      'focus:primary-bg-solid focus:primary-fg-contrast',
      'ark-literal:min-w-0 ark-literal:px-0 ark-literal:base-fg-muted ark-literal:select-none',
    ],
    separator: 'text-dense-14 base-fg-muted',
  },
});

const styles = dateInputStyles();

type DateInputProps = Omit<ArkDateInput.RootProps, 'children'> & {
  label?: ReactNode;
  rangeSeparator?: string;
};

const Segments = () => (
  <ArkDateInput.SegmentContext>
    {(segment) => (
      <ArkDateInput.Segment segment={segment} className={styles.segment()} />
    )}
  </ArkDateInput.SegmentContext>
);

export const DateInput = ({
  label,
  rangeSeparator = '〜',
  selectionMode,
  // Two digits everywhere, so a typed date always reads yyyy/mm/dd.
  shouldForceLeadingZeros = true,
  className,
  ...props
}: DateInputProps) => {
  const isRange = selectionMode === 'range';
  return (
    <ArkDateInput.Root
      selectionMode={selectionMode}
      shouldForceLeadingZeros={shouldForceLeadingZeros}
      className={styles.root({ className })}
      {...props}
    >
      {label !== undefined && (
        <ArkDateInput.Label className={styles.label()}>
          {label}
        </ArkDateInput.Label>
      )}
      <ArkDateInput.Control className={styles.control()}>
        <ArkDateInput.SegmentGroup index={0} className={styles.segmentGroup()}>
          <Segments />
        </ArkDateInput.SegmentGroup>
        {isRange && (
          <>
            <span className={styles.separator()} aria-hidden="true">
              {rangeSeparator}
            </span>
            <ArkDateInput.SegmentGroup
              index={1}
              className={styles.segmentGroup()}
            >
              <Segments />
            </ArkDateInput.SegmentGroup>
          </>
        )}
      </ArkDateInput.Control>
      <ArkDateInput.HiddenInput index={0} />
      {isRange && <ArkDateInput.HiddenInput index={1} />}
    </ArkDateInput.Root>
  );
};
