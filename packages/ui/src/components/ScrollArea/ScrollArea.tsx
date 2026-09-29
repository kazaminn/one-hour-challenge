'use client';

import { ScrollArea as ArkScrollArea } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';

// Ark measures, drags and hides the scrollbars; this only styles them.
// Size the box through className (`h-48`, `max-h-72`, …).
const scrollAreaStyles = tv({
  slots: {
    root: 'group/scroll relative overflow-hidden',
    // The overlay bar replaces the native one. scrollbar-none needs
    // Chrome 121 / Safari 18.2; the -webkit- rule covers the floor below.
    viewport: [
      'size-full scrollbar-none overflow-auto rounded-[inherit] [&::-webkit-scrollbar]:hidden',
      focusRing(),
      'focus-visible:-outline-offset-2',
    ],
    content: '',
    // shown on hover, while scrolling, or while dragging
    scrollbar: [
      'absolute flex touch-none p-0.5 opacity-0 transition-opacity duration-transition ease-standard select-none',
      'group-hover/scroll:opacity-100 ark-hover:opacity-100 ark-dragging:opacity-100 ark-scrolling:opacity-100',
      'ark-vertical:top-0 ark-vertical:right-0 ark-vertical:h-full ark-vertical:w-2.5 ark-vertical:flex-col',
      'ark-horizontal:bottom-0 ark-horizontal:left-0 ark-horizontal:h-2.5 ark-horizontal:w-full ark-horizontal:flex-row',
    ],
    thumb: [
      'relative flex-1 rounded-pill bg-(--r-base-fg-subtle) transition-colors',
      'ark-hover:bg-(--r-base-fg-muted) ark-dragging:bg-(--r-base-fg-muted)',
    ],
    corner: 'base-bg-muted',
  },
  variants: {
    orientation: {
      vertical: { content: 'w-full' },
      horizontal: { content: 'w-max min-w-full' },
      both: { content: 'w-max min-w-full' },
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

type ScrollAreaProps = ArkScrollArea.RootProps &
  VariantProps<typeof scrollAreaStyles>;

const Scrollbar = ({
  orientation,
  className,
  thumbClassName,
}: {
  orientation: 'vertical' | 'horizontal';
  className: string;
  thumbClassName: string;
}) => (
  <ArkScrollArea.Scrollbar orientation={orientation} className={className}>
    <ArkScrollArea.Thumb className={thumbClassName} />
  </ArkScrollArea.Scrollbar>
);

export const ScrollArea = ({
  orientation = 'vertical',
  className,
  children,
  ...props
}: ScrollAreaProps) => {
  const styles = scrollAreaStyles({ orientation });
  const vertical = orientation !== 'horizontal';
  const horizontal = orientation !== 'vertical';
  return (
    <ArkScrollArea.Root className={styles.root({ className })} {...props}>
      <ArkScrollArea.Viewport className={styles.viewport()}>
        <ArkScrollArea.Content className={styles.content()}>
          {children}
        </ArkScrollArea.Content>
      </ArkScrollArea.Viewport>
      {vertical && (
        <Scrollbar
          orientation="vertical"
          className={styles.scrollbar()}
          thumbClassName={styles.thumb()}
        />
      )}
      {horizontal && (
        <Scrollbar
          orientation="horizontal"
          className={styles.scrollbar()}
          thumbClassName={styles.thumb()}
        />
      )}
      {orientation === 'both' && (
        <ArkScrollArea.Corner className={styles.corner()} />
      )}
    </ArkScrollArea.Root>
  );
};
