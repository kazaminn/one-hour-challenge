'use client';

// The default `translations` carry a function, which a Server Component
// could not hand to Ark's client parts; the wrapper is the interactive leaf.
import { Clipboard as ArkClipboard } from '@ark-ui/react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

// Ark owns the copy itself, the copied state (data-copied on every part)
// and the trigger's aria-label; these parts only style them.
const clipboardStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    control: 'flex items-center gap-2',
    input: [
      'min-w-0 flex-1 rounded-control border base-border-muted base-bg px-3 py-2',
      'font-mono text-mono-14 base-fg',
      focusRing(),
    ],
    trigger: [
      'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-control border base-border-solid px-3',
      'text-oneline-14 font-medium base-fg-strong transition-colors',
      'hover:base-bg-subtle',
      'ark-copied:success-border-solid ark-copied:success-fg',
      focusRing(),
    ],
    indicator: 'inline-flex items-center',
    valueText: 'font-mono text-mono-14 base-fg',
  },
});

const styles = clipboardStyles();

const defaultTranslations: ArkClipboard.RootProps['translations'] = {
  triggerLabel: (copied) => (copied ? 'コピーしました' : 'コピー'),
};

export const ClipboardRoot = ({
  className,
  translations,
  ...props
}: ArkClipboard.RootProps) => (
  <ArkClipboard.Root
    className={styles.root({ className })}
    translations={{ ...defaultTranslations, ...translations }}
    {...props}
  />
);

export const ClipboardLabel = ({
  className,
  ...props
}: ArkClipboard.LabelProps) => (
  <ArkClipboard.Label className={styles.label({ className })} {...props} />
);

export const ClipboardControl = ({
  className,
  ...props
}: ArkClipboard.ControlProps) => (
  <ArkClipboard.Control className={styles.control({ className })} {...props} />
);

export const ClipboardInput = ({
  className,
  ...props
}: ArkClipboard.InputProps) => (
  <ArkClipboard.Input className={styles.input({ className })} {...props} />
);

export const ClipboardTrigger = ({
  className,
  ...props
}: ArkClipboard.TriggerProps) => (
  <ArkClipboard.Trigger className={styles.trigger({ className })} {...props} />
);

export const ClipboardIndicator = ({
  className,
  ...props
}: ArkClipboard.IndicatorProps) => (
  <ArkClipboard.Indicator
    className={styles.indicator({ className })}
    {...props}
  />
);

export const ClipboardValueText = ({
  className,
  ...props
}: ArkClipboard.ValueTextProps) => (
  <ArkClipboard.ValueText
    className={styles.valueText({ className })}
    {...props}
  />
);

export const Clipboard = {
  Root: ClipboardRoot,
  Label: ClipboardLabel,
  Control: ClipboardControl,
  Input: ClipboardInput,
  Trigger: ClipboardTrigger,
  Indicator: ClipboardIndicator,
  ValueText: ClipboardValueText,
};
