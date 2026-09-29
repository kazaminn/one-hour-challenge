'use client';

import { Field as ArkField } from '@ark-ui/react';
import { tv } from '../../tv';
import { inputStyles } from '../Input';

const fieldStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    // The shared text control recipe, plus the state Ark propagates from
    // Field.Root to every part as data-invalid / data-disabled.
    control: [
      inputStyles(),
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
    ],
    errorText: 'text-dense-14 error-fg',
    helperText: 'text-dense-14 base-fg-muted',
    requiredIndicator: 'error-fg',
  },
});

const styles = fieldStyles();

export const FieldRoot = ({ className, ...props }: ArkField.RootProps) => (
  <ArkField.Root className={styles.root({ className })} {...props} />
);

export const FieldLabel = ({ className, ...props }: ArkField.LabelProps) => (
  <ArkField.Label className={styles.label({ className })} {...props} />
);

export const FieldInput = ({ className, ...props }: ArkField.InputProps) => (
  <ArkField.Input className={styles.control({ className })} {...props} />
);

export const FieldTextarea = ({
  className,
  ...props
}: ArkField.TextareaProps) => (
  <ArkField.Textarea
    className={styles.control({
      className: `min-h-20 resize-y ${className ?? ''}`,
    })}
    {...props}
  />
);

// A native <select>; the styled Ark Select arrives in a later phase.
export const FieldSelect = ({ className, ...props }: ArkField.SelectProps) => (
  <ArkField.Select
    className={styles.control({ className: ['cursor-default', className] })}
    {...props}
  />
);

export const FieldErrorText = ({
  className,
  ...props
}: ArkField.ErrorTextProps) => (
  <ArkField.ErrorText className={styles.errorText({ className })} {...props} />
);

export const FieldHelperText = ({
  className,
  ...props
}: ArkField.HelperTextProps) => (
  <ArkField.HelperText
    className={styles.helperText({ className })}
    {...props}
  />
);

export const FieldRequiredIndicator = ({
  className,
  ...props
}: ArkField.RequiredIndicatorProps) => (
  <ArkField.RequiredIndicator
    className={styles.requiredIndicator({ className })}
    {...props}
  />
);

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Input: FieldInput,
  Textarea: FieldTextarea,
  Select: FieldSelect,
  ErrorText: FieldErrorText,
  HelperText: FieldHelperText,
  RequiredIndicator: FieldRequiredIndicator,
};
