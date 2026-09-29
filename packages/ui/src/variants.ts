import { tv } from './tv';

// Shared keyboard-focus ring, merged into each component's styles.
export const focusRing = tv({
  base: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:primary-focus-ring',
});

// For Ark parts whose real control is visually hidden — Ark forwards
// keyboard focus as data-focus-visible on the styled part.
export const focusRingWithin = tv({
  base: 'ark-focus-visible:outline-2 ark-focus-visible:outline-offset-2 ark-focus-visible:primary-focus-ring',
});

// The gap scale shared by the layout primitives (Stack, Inline, Grid).
export const gapVariants = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
} as const;

// The floating list shared by Select, Combobox and Menu: Ark positions the
// positioner, highlights items with data-highlighted and marks the chosen
// ones with data-state=checked.
export const menuListStyles = tv({
  slots: {
    // Zag's popper reads the positioner's *first child*'s computed
    // z-index and copies it onto the positioner's own inline
    // `--z-index` (which its inline `z-index: var(--z-index)` then
    // uses) — so the z-index utility has to live on `content`, the
    // positioner's first child, not on the positioner itself, or the
    // inline style silently overrides it back to `auto`.
    positioner: '',
    content: [
      'z-popover max-h-72 min-w-40 overflow-y-auto rounded-overlay border base-border-muted base-bg p-1 shadow-floating',
      'ark-open:animate-fade-in ark-closed:animate-fade-out',
    ],
    item: [
      'flex cursor-default items-center gap-2 rounded-control px-2 py-1.5 text-dense-14 base-fg select-none',
      'ark-highlighted:base-bg-muted ark-highlighted:base-fg-strong',
      'ark-checked:font-medium ark-checked:base-fg-strong',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
    ],
    itemText: 'flex-1 truncate',
    itemIndicator: 'inline-flex primary-fg [&>svg]:size-4',
    itemGroupLabel: 'px-2 py-1 text-oneline-14 font-bold base-fg-muted',
    separator: 'my-1 border-t base-border-muted',
    empty: 'px-2 py-1.5 text-dense-14 base-fg-muted',
  },
});

// Select, Listbox and Combobox all group items by an optional `group`
// field, grouping unset items under ''. Splitting the '' bucket out here
// means each wrapper can skip an ItemGroupLabel for it — an empty label
// would otherwise announce an unnamed group to screen readers.
export type GroupedItemsBucket<T> = {
  key: string;
  label: string | undefined;
  items: T[];
};

export const splitGroupedItems = <T>(
  entries: [string, T[]][],
): GroupedItemsBucket<T>[] =>
  entries.map(([key, items]) => ({
    key,
    label: key === '' ? undefined : key,
    items,
  }));
