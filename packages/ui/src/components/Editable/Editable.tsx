'use client';

// The edit/save/cancel controls follow Ark's editing state through a
// render prop, so the wrapper is a client leaf.
import type { ReactNode } from 'react';
import { Editable as ArkEditable } from '@ark-ui/react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';
import { Button } from '../Button';
import { inputStyles } from '../Input';

// Text edited in place: the preview and the input share the text-control
// recipe so the box does not jump when editing starts. Ark swaps the two
// (or overlays them under autoResize) and owns Enter/Escape.
const editableStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    // A grid so an auto-resizing preview and input can share one cell.
    area: 'grid',
    preview: [
      inputStyles(),
      'cursor-text border-transparent',
      'hover:base-border-muted',
      'ark-placeholder-shown:base-fg-muted',
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      'ark-readonly:cursor-default',
    ],
    input: [
      inputStyles(),
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
    ],
    control: 'flex gap-2',
  },
  variants: {
    multiline: {
      true: {
        preview: 'min-h-20 whitespace-pre-wrap',
        input: 'min-h-20 resize-y',
      },
    },
  },
  defaultVariants: { multiline: false },
});

const defaultTranslations: ArkEditable.RootProps['translations'] = {
  // Ark would put an English aria-label on the input, which beats the
  // visible <label>; an empty one is ignored and the label names it.
  input: '',
  edit: '編集',
  submit: '保存',
  cancel: 'キャンセル',
};

type EditableProps = Omit<ArkEditable.RootProps, 'children'> & {
  label?: ReactNode;
  controls?: boolean;
  // Edit in a textarea; Enter inserts a line, Ctrl/Cmd+Enter saves.
  multiline?: boolean;
};

const styles = editableStyles();

const Controls = () => (
  <ArkEditable.Context>
    {(editable) => (
      <ArkEditable.Control className={styles.control()}>
        {editable.editing ? (
          <>
            <ArkEditable.SubmitTrigger asChild>
              <Button size="sm">保存</Button>
            </ArkEditable.SubmitTrigger>
            <ArkEditable.CancelTrigger asChild>
              <Button size="sm" variant="outline">
                キャンセル
              </Button>
            </ArkEditable.CancelTrigger>
          </>
        ) : (
          <ArkEditable.EditTrigger asChild>
            <Button size="sm" variant="outline">
              編集
            </Button>
          </ArkEditable.EditTrigger>
        )}
      </ArkEditable.Control>
    )}
  </ArkEditable.Context>
);

export const Editable = ({
  label,
  controls = false,
  multiline = false,
  translations,
  className,
  ...props
}: EditableProps) => {
  const slots = editableStyles({ multiline });
  return (
    <ArkEditable.Root
      className={slots.root({ className })}
      translations={{ ...defaultTranslations, ...translations }}
      {...props}
    >
      {label !== undefined && (
        <ArkEditable.Label className={slots.label()}>{label}</ArkEditable.Label>
      )}
      <ArkEditable.Area className={slots.area()}>
        {multiline ? (
          <ArkEditable.Input className={slots.input()} asChild>
            <textarea />
          </ArkEditable.Input>
        ) : (
          <ArkEditable.Input className={slots.input()} />
        )}
        <ArkEditable.Preview
          className={slots.preview({ className: focusRing() })}
        />
      </ArkEditable.Area>
      {controls && <Controls />}
    </ArkEditable.Root>
  );
};
