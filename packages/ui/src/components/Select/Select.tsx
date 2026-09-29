'use client';

// Ark needs a collection object (functions inside), which a Server
// Component could not pass down; so the wrapper builds it from plain
// items and renders the whole control.
import type { ReactNode } from 'react';
import {
  Select as ArkSelect,
  createListCollection,
  Portal,
} from '@ark-ui/react';
import { Check, ChevronDown } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing, menuListStyles, splitGroupedItems } from '../../variants';
import { inputStyles } from '../Input';

const selectStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    control: 'relative',
    trigger: [
      inputStyles(),
      'flex cursor-default items-center justify-between gap-2 text-start',
      'ark-placeholder-shown:base-fg-muted',
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      focusRing(),
    ],
    indicator: [
      'inline-flex shrink-0 base-fg-muted transition-transform duration-transition ease-standard [&>svg]:size-4',
      'ark-open:rotate-180',
    ],
  },
});

const styles = selectStyles();
const list = menuListStyles();

export type SelectItem = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

const defaultPositioning: ArkSelect.RootProps<SelectItem>['positioning'] = {
  sameWidth: true,
  gutter: 4,
};

type SelectProps = Omit<
  ArkSelect.RootProps<SelectItem>,
  'collection' | 'children'
> & {
  items: SelectItem[];
  label?: ReactNode;
  placeholder?: string;
};

const Item = ({ item }: { item: SelectItem }) => (
  <ArkSelect.Item item={item} className={list.item()}>
    <ArkSelect.ItemText className={list.itemText()}>
      {item.label}
    </ArkSelect.ItemText>
    <ArkSelect.ItemIndicator className={list.itemIndicator()}>
      <Check aria-hidden="true" />
    </ArkSelect.ItemIndicator>
  </ArkSelect.Item>
);

export const Select = ({
  items,
  label,
  placeholder = '選択してください',
  className,
  positioning,
  ...props
}: SelectProps) => {
  const collection = createListCollection<SelectItem>({
    items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    isItemDisabled: (item) => item.disabled === true,
    groupBy: (item) => item.group ?? '',
  });
  const grouped = items.some((item) => item.group !== undefined);

  return (
    <ArkSelect.Root
      collection={collection}
      positioning={{ ...defaultPositioning, ...positioning }}
      className={styles.root({ className })}
      {...props}
    >
      {label !== undefined && (
        <ArkSelect.Label className={styles.label()}>{label}</ArkSelect.Label>
      )}
      <ArkSelect.Control className={styles.control()}>
        <ArkSelect.Trigger className={styles.trigger()}>
          <ArkSelect.ValueText placeholder={placeholder} />
          <ArkSelect.Indicator className={styles.indicator()}>
            <ChevronDown aria-hidden="true" />
          </ArkSelect.Indicator>
        </ArkSelect.Trigger>
      </ArkSelect.Control>
      <Portal>
        <ArkSelect.Positioner className={list.positioner()}>
          <ArkSelect.Content className={list.content({ className: 'w-full' })}>
            {grouped
              ? splitGroupedItems(collection.group()).map(
                  ({ key, label, items: groupItems }) =>
                    label !== undefined ? (
                      <ArkSelect.ItemGroup key={key}>
                        <ArkSelect.ItemGroupLabel
                          className={list.itemGroupLabel()}
                        >
                          {label}
                        </ArkSelect.ItemGroupLabel>
                        {groupItems.map((item) => (
                          <Item key={item.value} item={item} />
                        ))}
                      </ArkSelect.ItemGroup>
                    ) : (
                      groupItems.map((item) => (
                        <Item key={item.value} item={item} />
                      ))
                    ),
                )
              : items.map((item) => <Item key={item.value} item={item} />)}
          </ArkSelect.Content>
        </ArkSelect.Positioner>
      </Portal>
      <ArkSelect.HiddenSelect />
    </ArkSelect.Root>
  );
};
