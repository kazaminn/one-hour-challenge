'use client';

import { Accordion as ArkAccordion } from '@ark-ui/react';
import { ChevronDown } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

// Ark owns which items are open, the button / region roles, aria-expanded
// / aria-controls and the `hidden` attribute; these parts only style them.
const accordionStyles = tv({
  slots: {
    root: 'flex flex-col',
    item: 'border-b base-border-muted ark-disabled:opacity-50',
    itemTrigger: [
      'flex w-full items-center justify-between gap-3 rounded-control py-3 text-start text-body-16 font-medium base-fg-strong transition-colors',
      'hover:base-fg',
      'ark-disabled:pointer-events-none',
      focusRing(),
    ],
    itemIndicator: [
      'inline-flex shrink-0 base-fg-muted transition-transform duration-transition ease-standard [&>svg]:size-4',
      'ark-open:rotate-180',
    ],
    itemContent: 'pb-4 text-body-16 base-fg',
  },
});

const styles = accordionStyles();

export const AccordionRoot = ({
  className,
  ...props
}: ArkAccordion.RootProps) => (
  <ArkAccordion.Root className={styles.root({ className })} {...props} />
);

export const AccordionItem = ({
  className,
  ...props
}: ArkAccordion.ItemProps) => (
  <ArkAccordion.Item className={styles.item({ className })} {...props} />
);

export const AccordionItemTrigger = ({
  className,
  ...props
}: ArkAccordion.ItemTriggerProps) => (
  <ArkAccordion.ItemTrigger
    className={styles.itemTrigger({ className })}
    {...props}
  />
);

// A chevron unless children say otherwise; flips while the item is open.
export const AccordionItemIndicator = ({
  className,
  children,
  ...props
}: ArkAccordion.ItemIndicatorProps) => (
  <ArkAccordion.ItemIndicator
    className={styles.itemIndicator({ className })}
    {...props}
  >
    {children ?? <ChevronDown aria-hidden="true" />}
  </ArkAccordion.ItemIndicator>
);

export const AccordionItemContent = ({
  className,
  ...props
}: ArkAccordion.ItemContentProps) => (
  <ArkAccordion.ItemContent
    className={styles.itemContent({ className })}
    {...props}
  />
);
