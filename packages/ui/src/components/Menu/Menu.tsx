'use client';

import { Menu as ArkMenu, Portal } from '@ark-ui/react';
import { Check, ChevronRight } from 'lucide-react';
import { tv } from '../../tv';
import { menuListStyles } from '../../variants';

// Ark owns the menu / menuitem roles, keyboard navigation, typeahead and
// submenus; these parts only style them on the shared list recipe.
const list = menuListStyles();

const menuStyles = tv({
  slots: {
    triggerItem: 'justify-between',
    triggerItemIndicator: 'inline-flex base-fg-muted [&>svg]:size-4',
  },
});

const styles = menuStyles();

const defaultPositioning: ArkMenu.RootProps['positioning'] = {
  placement: 'bottom-start',
  gutter: 4,
};

export const MenuRoot = ({ positioning, ...props }: ArkMenu.RootProps) => (
  <ArkMenu.Root
    positioning={{ ...defaultPositioning, ...positioning }}
    {...props}
  />
);

export const MenuTrigger = ArkMenu.Trigger;

export const MenuPortal = Portal;

export const MenuPositioner = ({
  className,
  ...props
}: ArkMenu.PositionerProps) => (
  <ArkMenu.Positioner className={list.positioner({ className })} {...props} />
);

export const MenuContent = ({ className, ...props }: ArkMenu.ContentProps) => (
  <ArkMenu.Content className={list.content({ className })} {...props} />
);

export const MenuItem = ({ className, ...props }: ArkMenu.ItemProps) => (
  <ArkMenu.Item className={list.item({ className })} {...props} />
);

export const MenuItemText = ({
  className,
  ...props
}: ArkMenu.ItemTextProps) => (
  <ArkMenu.ItemText className={list.itemText({ className })} {...props} />
);

export const MenuItemGroup = ArkMenu.ItemGroup;

export const MenuItemGroupLabel = ({
  className,
  ...props
}: ArkMenu.ItemGroupLabelProps) => (
  <ArkMenu.ItemGroupLabel
    className={list.itemGroupLabel({ className })}
    {...props}
  />
);

export const MenuSeparator = ({
  className,
  ...props
}: ArkMenu.SeparatorProps) => (
  <ArkMenu.Separator className={list.separator({ className })} {...props} />
);

export const MenuCheckboxItem = ({
  className,
  ...props
}: ArkMenu.CheckboxItemProps) => (
  <ArkMenu.CheckboxItem className={list.item({ className })} {...props} />
);

export const MenuRadioItemGroup = ArkMenu.RadioItemGroup;

export const MenuRadioItem = ({
  className,
  ...props
}: ArkMenu.RadioItemProps) => (
  <ArkMenu.RadioItem className={list.item({ className })} {...props} />
);

export const MenuItemIndicator = ({
  className,
  children,
  ...props
}: ArkMenu.ItemIndicatorProps) => (
  <ArkMenu.ItemIndicator
    className={list.itemIndicator({ className })}
    {...props}
  >
    {children ?? <Check aria-hidden="true" />}
  </ArkMenu.ItemIndicator>
);

// Opens a submenu; place a nested Menu.Root around it.
export const MenuTriggerItem = ({
  className,
  children,
  ...props
}: ArkMenu.TriggerItemProps) => (
  <ArkMenu.TriggerItem
    className={list.item({ className: [styles.triggerItem(), className] })}
    {...props}
  >
    {children}
    <span className={styles.triggerItemIndicator()}>
      <ChevronRight aria-hidden="true" />
    </span>
  </ArkMenu.TriggerItem>
);
