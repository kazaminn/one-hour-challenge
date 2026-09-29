'use client';

import { Collapsible as ArkCollapsible } from '@ark-ui/react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

// Ark owns open state, aria-expanded / aria-controls and the `hidden`
// attribute on the content; these parts only style them.
const collapsibleStyles = tv({
  slots: {
    root: '',
    trigger: focusRing(),
    content: 'overflow-hidden',
    // A chevron placed in the trigger; flips while the content is open.
    indicator: [
      'inline-flex transition-transform duration-transition ease-standard',
      'ark-open:rotate-180',
    ],
  },
});

const styles = collapsibleStyles();

export const CollapsibleRoot = ({
  className,
  ...props
}: ArkCollapsible.RootProps) => (
  <ArkCollapsible.Root className={styles.root({ className })} {...props} />
);

export const CollapsibleTrigger = ({
  className,
  ...props
}: ArkCollapsible.TriggerProps) => (
  <ArkCollapsible.Trigger
    className={styles.trigger({ className })}
    {...props}
  />
);

export const CollapsibleContent = ({
  className,
  ...props
}: ArkCollapsible.ContentProps) => (
  <ArkCollapsible.Content
    className={styles.content({ className })}
    {...props}
  />
);

export const CollapsibleIndicator = ({
  className,
  ...props
}: ArkCollapsible.IndicatorProps) => (
  <ArkCollapsible.Indicator
    className={styles.indicator({ className })}
    {...props}
  />
);

export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
  Indicator: CollapsibleIndicator,
};
