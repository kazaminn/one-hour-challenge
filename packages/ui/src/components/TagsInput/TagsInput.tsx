'use client';

// The tags are read back from Ark's context (a render prop), and the
// default `translations` carry functions, so the wrapper is a client leaf.
import type { ReactNode } from 'react';
import { TagsInput as ArkTagsInput } from '@ark-ui/react';
import { X } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';
import { inputStyles } from '../Input';

// A text box that turns each entry into a Chip-like tag. The box is the
// Control (Ark marks it data-focus while the inner input has focus), so
// the focus ring sits on the box rather than on the borderless input.
const tagsInputStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    control: [
      inputStyles(),
      'flex cursor-text flex-wrap items-center gap-1.5 py-1.5',
      'ark-focus:outline-2 ark-focus:outline-offset-2 ark-focus:primary-focus-ring',
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
    ],
    item: 'inline-flex',
    itemPreview: [
      'inline-flex h-7 items-center gap-1 rounded-pill base-bg-muted ps-2.5 pe-0.5 text-oneline-14 font-medium base-fg-strong',
      'ark-highlighted:base-bg-selected',
    ],
    itemText: 'truncate',
    itemDeleteTrigger: [
      'inline-flex size-6 shrink-0 items-center justify-center rounded-pill base-fg-muted [&>svg]:size-3.5',
      'hover:base-bg-selected hover:base-fg-strong',
      focusRing(),
    ],
    itemInput:
      'h-7 min-w-20 rounded-tight px-1 text-oneline-14 base-fg outline-none',
    input: [
      'min-w-24 flex-1 bg-transparent text-body-16 base-fg outline-none',
      'placeholder:base-fg-muted',
    ],
    clearTrigger: [
      'inline-flex size-6 shrink-0 items-center justify-center rounded-pill base-fg-muted [&>svg]:size-4',
      'hover:base-fg-strong',
      focusRing(),
    ],
  },
});

const styles = tagsInputStyles();

const defaultTranslations: ArkTagsInput.RootProps['translations'] = {
  clearTriggerLabel: 'すべてのタグを削除',
  deleteTagTriggerLabel: (value) => `${value}を削除`,
  tagAdded: (value) => `${value}を追加しました`,
  tagsPasted: (values) => `${values.length}件のタグを貼り付けました`,
  tagEdited: (value) =>
    `${value}を編集中。Enterで保存、Escapeでキャンセルします。`,
  tagUpdated: (value) => `${value}に更新しました`,
  tagDeleted: (value) => `${value}を削除しました`,
  tagSelected: (value) =>
    `${value}を選択中。Enterで編集、DeleteかBackspaceで削除します。`,
  noTagsSelected: 'タグはありません',
  inputLabel: (count) => `${count}件のタグ`,
};

type TagsInputProps = Omit<ArkTagsInput.RootProps, 'children'> & {
  label?: ReactNode;
};

export const TagsInput = ({
  label,
  translations,
  className,
  ...props
}: TagsInputProps) => (
  <ArkTagsInput.Root
    className={styles.root({ className })}
    translations={{ ...defaultTranslations, ...translations }}
    {...props}
  >
    {label !== undefined && (
      <ArkTagsInput.Label className={styles.label()}>
        {label}
      </ArkTagsInput.Label>
    )}
    <ArkTagsInput.Control className={styles.control()}>
      <ArkTagsInput.Context>
        {(tagsInput) =>
          tagsInput.value.map((value, index) => (
            <ArkTagsInput.Item
              key={`${index}-${value}`}
              index={index}
              value={value}
              className={styles.item()}
            >
              <ArkTagsInput.ItemPreview className={styles.itemPreview()}>
                <ArkTagsInput.ItemText className={styles.itemText()}>
                  {value}
                </ArkTagsInput.ItemText>
                <ArkTagsInput.ItemDeleteTrigger
                  className={styles.itemDeleteTrigger()}
                >
                  <X aria-hidden="true" />
                </ArkTagsInput.ItemDeleteTrigger>
              </ArkTagsInput.ItemPreview>
              <ArkTagsInput.ItemInput className={styles.itemInput()} />
            </ArkTagsInput.Item>
          ))
        }
      </ArkTagsInput.Context>
      <ArkTagsInput.Input className={styles.input()} />
      <ArkTagsInput.ClearTrigger className={styles.clearTrigger()}>
        <X aria-hidden="true" />
      </ArkTagsInput.ClearTrigger>
    </ArkTagsInput.Control>
    <ArkTagsInput.HiddenInput />
  </ArkTagsInput.Root>
);
