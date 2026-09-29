'use client';

import { Tabs as ArkTabs } from '@ark-ui/react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

// Ark owns selection, roving focus, aria-selected / aria-controls and the
// `hidden` attribute on the content; these parts only style them.
const tabsStyles = tv({
  slots: {
    root: 'flex flex-col gap-4 ark-vertical:flex-row',
    list: [
      'relative flex gap-1 border-b base-border-muted',
      'ark-vertical:flex-col ark-vertical:border-r ark-vertical:border-b-0',
    ],
    trigger: [
      'inline-flex h-10 items-center gap-2 px-3 text-oneline-14 font-medium base-fg-muted transition-colors',
      'hover:base-fg-strong',
      'ark-selected:primary-fg',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      focusRing(),
    ],
    content: focusRing(),
    // Ark positions the indicator through --left / --width (horizontal)
    // or --top / --height (vertical); the tokens set the transition.
    indicator: [
      'bottom-0 h-0.5 w-(--width) primary-bg-solid',
      'ark-vertical:right-0 ark-vertical:h-(--height) ark-vertical:w-0.5',
      '[--transition-duration:var(--duration-transition)] [--transition-timing-function:var(--ease-standard)]',
    ],
  },
});

const styles = tabsStyles();

export const TabsRoot = ({ className, ...props }: ArkTabs.RootProps) => (
  <ArkTabs.Root className={styles.root({ className })} {...props} />
);

export const TabsList = ({ className, ...props }: ArkTabs.ListProps) => (
  <ArkTabs.List className={styles.list({ className })} {...props} />
);

export const TabsTrigger = ({ className, ...props }: ArkTabs.TriggerProps) => (
  <ArkTabs.Trigger className={styles.trigger({ className })} {...props} />
);

export const TabsContent = ({ className, ...props }: ArkTabs.ContentProps) => (
  <ArkTabs.Content className={styles.content({ className })} {...props} />
);

export const TabsIndicator = ({
  className,
  ...props
}: ArkTabs.IndicatorProps) => (
  <ArkTabs.Indicator className={styles.indicator({ className })} {...props} />
);

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator,
};
