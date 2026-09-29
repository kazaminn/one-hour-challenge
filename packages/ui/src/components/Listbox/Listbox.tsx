'use client';

// Ark needs a collection object (functions inside), which a Server
// Component could not pass down; so the wrapper builds it from plain
// items and renders the whole list.
import type { ReactNode } from 'react';
import { Listbox as ArkListbox, createListCollection } from '@ark-ui/react';
import { Check } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing, menuListStyles, splitGroupedItems } from '../../variants';

// The items share the floating-list recipe with Select, so an option looks
// the same whether it sits in a dropdown or in an always-visible list.
const listboxStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5 ark-disabled:opacity-50',
    label: 'text-dense-14 font-medium base-fg-strong',
    content: [
      'max-h-72 overflow-y-auto rounded-overlay border base-border-muted base-bg p-1',
      'ark-horizontal:flex ark-horizontal:max-h-none ark-horizontal:overflow-x-auto',
      focusRing(),
    ],
  },
});

const styles = listboxStyles();
const list = menuListStyles();

export type ListboxItem = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
};

type ListboxProps = Omit<
  ArkListbox.RootProps<ListboxItem>,
  'collection' | 'children'
> & {
  items: ListboxItem[];
  label?: ReactNode;
};

const Item = ({ item }: { item: ListboxItem }) => (
  <ArkListbox.Item item={item} className={list.item()}>
    <ArkListbox.ItemText className={list.itemText()}>
      {item.label}
    </ArkListbox.ItemText>
    <ArkListbox.ItemIndicator className={list.itemIndicator()}>
      <Check aria-hidden="true" />
    </ArkListbox.ItemIndicator>
  </ArkListbox.Item>
);

export const Listbox = ({
  items,
  label,
  className,
  ...props
}: ListboxProps) => {
  const collection = createListCollection<ListboxItem>({
    items,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    isItemDisabled: (item) => item.disabled === true,
    groupBy: (item) => item.group ?? '',
  });
  const grouped = items.some((item) => item.group !== undefined);

  return (
    <ArkListbox.Root
      collection={collection}
      className={styles.root({ className })}
      {...props}
    >
      {label !== undefined && (
        <ArkListbox.Label className={styles.label()}>{label}</ArkListbox.Label>
      )}
      <ArkListbox.Content className={styles.content()}>
        {grouped
          ? splitGroupedItems(collection.group()).map(
              ({ key, label, items: groupItems }) =>
                label !== undefined ? (
                  <ArkListbox.ItemGroup key={key}>
                    <ArkListbox.ItemGroupLabel
                      className={list.itemGroupLabel()}
                    >
                      {label}
                    </ArkListbox.ItemGroupLabel>
                    {groupItems.map((item) => (
                      <Item key={item.value} item={item} />
                    ))}
                  </ArkListbox.ItemGroup>
                ) : (
                  groupItems.map((item) => (
                    <Item key={item.value} item={item} />
                  ))
                ),
            )
          : items.map((item) => <Item key={item.value} item={item} />)}
      </ArkListbox.Content>
    </ArkListbox.Root>
  );
};
