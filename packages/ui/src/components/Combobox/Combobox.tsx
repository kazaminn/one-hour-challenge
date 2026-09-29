'use client';

// The filtered collection lives on the client, so the wrapper renders the
// whole control from plain items: single or multiple values, groups, an
// empty state, an option to create the typed value, and a loading state
// for items fetched while typing.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import {
  Combobox as ArkCombobox,
  Portal,
  useComboboxContext,
  useFilter,
  useListCollection,
} from '@ark-ui/react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing, menuListStyles, splitGroupedItems } from '../../variants';
import { Chip } from '../Chip';
import { inputStyles } from '../Input';
import { Spinner } from '../Spinner';

const comboboxStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    control: 'relative',
    input: [
      inputStyles(),
      'pe-10',
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
    ],
    trigger: [
      'absolute inset-y-0 end-0 inline-flex w-10 items-center justify-center rounded-control base-fg-muted [&>svg]:size-4',
      'ark-open:[&>svg]:rotate-180',
      focusRing(),
    ],
    selected: 'flex flex-wrap gap-1.5',
    loading: 'flex items-center gap-2 px-3 py-2 text-dense-14 base-fg-muted',
    create: 'inline-flex items-center gap-2 [&>svg]:size-4',
  },
});

const styles = comboboxStyles();
const list = menuListStyles();

export type ComboboxItem = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

const defaultPositioning: ArkCombobox.RootProps<ComboboxItem>['positioning'] = {
  sameWidth: true,
  gutter: 4,
};

const NEW_OPTION = '[[new]]';

type ComboboxProps = Omit<
  ArkCombobox.RootProps<ComboboxItem>,
  'collection' | 'children'
> & {
  items: ComboboxItem[];
  label?: ReactNode;
  placeholder?: string;
  emptyText?: string;
  creatable?: boolean;
  onCreate?: (label: string) => void;
  createText?: (label: string) => string;
  loading?: boolean;
  loadingText?: string;
};

const Item = ({
  item,
  createText,
}: {
  item: ComboboxItem;
  createText: (label: string) => string;
}) => (
  <ArkCombobox.Item item={item} className={list.item()}>
    <ArkCombobox.ItemText className={list.itemText()}>
      {item.value === NEW_OPTION ? (
        <span className={styles.create()}>
          <Plus aria-hidden="true" />
          {createText(item.label)}
        </span>
      ) : (
        item.label
      )}
    </ArkCombobox.ItemText>
    <ArkCombobox.ItemIndicator className={list.itemIndicator()}>
      <Check aria-hidden="true" />
    </ArkCombobox.ItemIndicator>
  </ArkCombobox.Item>
);

const SelectedChips = () => {
  const combobox = useComboboxContext();
  // The context is not generic; the collection was built from ComboboxItem.
  const selected = combobox.selectedItems as ComboboxItem[];
  // Keyed by value so a chip's <li> can be found again after the list
  // re-renders shorter, to move focus onto a neighbour.
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  if (selected.length === 0) return undefined;

  // Removing a chip drops its button from the page; focus must land
  // somewhere deliberate — the next chip, else the previous one, else
  // back on the input — instead of falling back to <body>.
  const handleRemove = (value: string): void => {
    const index = selected.findIndex((item) => item.value === value);
    const focusTarget =
      selected[index + 1]?.value ?? selected[index - 1]?.value;
    flushSync(() => combobox.clearValue(value));
    const nextButton = focusTarget
      ? itemRefs.current.get(focusTarget)?.querySelector('button')
      : null;
    if (nextButton) {
      nextButton.focus();
    } else {
      combobox.focus();
    }
  };

  return (
    <ul className={styles.selected()}>
      {selected.map((item) => (
        <li
          key={item.value}
          ref={(el) => {
            if (el) itemRefs.current.set(item.value, el);
            else itemRefs.current.delete(item.value);
          }}
        >
          <Chip onRemove={() => handleRemove(item.value)}>{item.label}</Chip>
        </li>
      ))}
    </ul>
  );
};

export const Combobox = ({
  items,
  label,
  placeholder = '入力して検索',
  emptyText = '該当する項目がありません',
  creatable = false,
  onCreate,
  createText = (text) => `「${text}」を追加`,
  loading = false,
  loadingText = '読み込み中',
  multiple,
  value: valueProp,
  defaultValue,
  onValueChange,
  className,
  positioning,
  onInputValueChange,
  ...props
}: ComboboxProps) => {
  const filters = useFilter({ sensitivity: 'base' });
  const { collection, filter, set, upsert, remove, update } =
    useListCollection<ComboboxItem>({
      initialItems: items,
      filter: (itemText, filterText) => filters.contains(itemText, filterText),
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
      isItemDisabled: (item) => item.disabled === true,
      groupBy: (item) => item.group ?? '',
    });
  const grouped = items.some((item) => item.group !== undefined);

  // Items fetched later replace the collection; the first set is the
  // initial one, so only later changes are applied.
  const previousItems = useRef(items);
  useEffect(() => {
    if (previousItems.current !== items) {
      previousItems.current = items;
      set(items);
    }
  }, [items, set]);

  // The value is tracked here so a created option can take the typed
  // label as its value the moment it is chosen.
  const [internalValue, setInternalValue] = useState<string[]>(
    defaultValue ?? [],
  );
  const value = valueProp ?? internalValue;
  const [inputValue, setInputValue] = useState('');

  const isNewLabel = (text: string): boolean =>
    text.trim() !== '' &&
    !items.some((item) => item.label.toLowerCase() === text.toLowerCase());

  return (
    <ArkCombobox.Root
      collection={collection}
      positioning={{ ...defaultPositioning, ...positioning }}
      className={styles.root({ className })}
      multiple={multiple}
      selectionBehavior={multiple === true ? 'clear' : undefined}
      closeOnSelect={multiple === true ? false : undefined}
      allowCustomValue={creatable}
      value={value}
      onValueChange={(details) => {
        let next = details.value;
        let nextItems = details.items;
        if (creatable && next.includes(NEW_OPTION)) {
          const created = inputValue.trim();
          const createdItem = { value: created, label: created };
          next = next.map((entry) => (entry === NEW_OPTION ? created : entry));
          // details.items still holds the placeholder item; rebuild it
          // from the normalized item so value and items stay in sync.
          nextItems = nextItems.map((item) =>
            item.value === NEW_OPTION ? createdItem : item,
          );
          update(NEW_OPTION, createdItem);
          onCreate?.(created);
        }
        setInternalValue(next);
        onValueChange?.({ ...details, value: next, items: nextItems });
      }}
      onInputValueChange={(details) => {
        if (creatable) {
          // The collection must hold the new option before it is filtered.
          flushSync(() => {
            if (isNewLabel(details.inputValue)) {
              upsert(NEW_OPTION, {
                value: NEW_OPTION,
                label: details.inputValue.trim(),
              });
            } else {
              remove(NEW_OPTION);
            }
          });
        }
        filter(details.inputValue);
        setInputValue(details.inputValue);
        onInputValueChange?.(details);
      }}
      {...props}
    >
      {label !== undefined && (
        <ArkCombobox.Label className={styles.label()}>
          {label}
        </ArkCombobox.Label>
      )}
      {multiple === true && <SelectedChips />}
      <ArkCombobox.Control className={styles.control()}>
        <ArkCombobox.Input
          placeholder={placeholder}
          className={styles.input()}
        />
        <ArkCombobox.Trigger className={styles.trigger()}>
          <ChevronDown aria-hidden="true" />
        </ArkCombobox.Trigger>
      </ArkCombobox.Control>
      <Portal>
        <ArkCombobox.Positioner className={list.positioner()}>
          <ArkCombobox.Content
            className={list.content({ className: 'w-full' })}
          >
            {loading ? (
              <div className={styles.loading()}>
                <Spinner size="sm" label={loadingText} />
                <span aria-hidden="true">{loadingText}</span>
              </div>
            ) : (
              <ArkCombobox.Empty className={list.empty()}>
                {emptyText}
              </ArkCombobox.Empty>
            )}
            {grouped
              ? splitGroupedItems(collection.group()).map(
                  ({ key, label: groupLabel, items: groupItems }) =>
                    groupLabel !== undefined ? (
                      <ArkCombobox.ItemGroup key={key}>
                        <ArkCombobox.ItemGroupLabel
                          className={list.itemGroupLabel()}
                        >
                          {groupLabel}
                        </ArkCombobox.ItemGroupLabel>
                        {groupItems.map((item) => (
                          <Item
                            key={item.value}
                            item={item}
                            createText={createText}
                          />
                        ))}
                      </ArkCombobox.ItemGroup>
                    ) : (
                      groupItems.map((item) => (
                        <Item
                          key={item.value}
                          item={item}
                          createText={createText}
                        />
                      ))
                    ),
                )
              : collection.items.map((item) => (
                  <Item key={item.value} item={item} createText={createText} />
                ))}
          </ArkCombobox.Content>
        </ArkCombobox.Positioner>
      </Portal>
    </ArkCombobox.Root>
  );
};
