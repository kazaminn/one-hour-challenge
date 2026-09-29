'use client';

import { Drawer as ArkDrawer } from '@ark-ui/react/drawer';
import { Portal } from '@ark-ui/react/portal';
import { tv, type VariantProps } from '../../tv';
import { dialogStyles } from '../Dialog/Dialog';

// A dialog that slides in from an edge. Ark owns open state, focus trap,
// swipe-to-dismiss and snap points, and tells every part which physical
// edge it came from through data-swipe-direction; the styles follow that,
// so Root's `swipeDirection` is the only placement setting.
// Header, Title, Description, Body, Footer and CloseTrigger share the
// Dialog styles so the two overlays read the same.
const positionerStyles = tv({
  base: [
    'fixed inset-0 z-modal flex',
    'ark-swipe-down:items-end ark-swipe-down:justify-center',
    'ark-swipe-up:items-start ark-swipe-up:justify-center',
    'ark-swipe-left:items-stretch ark-swipe-left:justify-start',
    'ark-swipe-right:items-stretch ark-swipe-right:justify-end',
  ],
});

const contentStyles = tv({
  base: [
    'relative flex w-full flex-col base-bg base-fg shadow-overlay outline-none',
    // The token keyframes animate `translate`, so they compose with the
    // `transform` Ark writes while the user swipes.
    'ark-swipe-down:max-h-[96dvh] ark-swipe-down:max-w-none ark-swipe-down:rounded-t-overlay',
    'ark-swipe-down:ark-open:animate-slide-in-from-bottom ark-swipe-down:ark-closed:animate-slide-out-to-bottom',
    'ark-swipe-up:max-h-[96dvh] ark-swipe-up:max-w-none ark-swipe-up:rounded-b-overlay',
    'ark-swipe-up:ark-open:animate-slide-in-from-top ark-swipe-up:ark-closed:animate-slide-out-to-top',
    'ark-swipe-left:h-full ark-swipe-left:rounded-e-overlay',
    'ark-swipe-left:ark-open:animate-slide-in-from-left ark-swipe-left:ark-closed:animate-slide-out-to-left',
    'ark-swipe-right:h-full ark-swipe-right:rounded-s-overlay',
    'ark-swipe-right:ark-open:animate-slide-in-from-right ark-swipe-right:ark-closed:animate-slide-out-to-right',
    // Overdrag reveals a bleed of the same background instead of a gap.
    'after:pointer-events-none after:absolute after:bg-inherit after:content-[""]',
    'ark-swipe-down:after:inset-x-0 ark-swipe-down:after:top-full ark-swipe-down:after:h-12',
    'ark-swipe-up:after:inset-x-0 ark-swipe-up:after:bottom-full ark-swipe-up:after:h-12',
    'ark-swipe-left:after:inset-y-0 ark-swipe-left:after:right-full ark-swipe-left:after:w-12',
    'ark-swipe-right:after:inset-y-0 ark-swipe-right:after:left-full ark-swipe-right:after:w-12',
  ],
  variants: {
    // the width of a side drawer; a top or bottom sheet spans the viewport
    size: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-2xl',
    },
  },
  defaultVariants: { size: 'md' },
});

const drawerStyles = tv({
  slots: {
    grabber: [
      'flex w-full shrink-0 cursor-grab touch-none items-center justify-center py-3 select-none',
      'active:cursor-grabbing',
    ],
    grabberIndicator: 'h-1 w-10 rounded-pill base-bg-muted',
    swipeArea: 'absolute inset-x-0 top-0 h-6',
  },
});

const styles = drawerStyles();
const shared = dialogStyles();

export const DrawerRoot = ArkDrawer.Root;

export const DrawerTrigger = ArkDrawer.Trigger;

export const DrawerContext = ArkDrawer.Context;

// Renders the positioner at the end of <body>, above the page's stacking.
export const DrawerPortal = Portal;

export const DrawerBackdrop = ({
  className,
  ...props
}: ArkDrawer.BackdropProps) => (
  <ArkDrawer.Backdrop className={shared.backdrop({ className })} {...props} />
);

export const DrawerPositioner = ({
  className,
  ...props
}: ArkDrawer.PositionerProps) => (
  <ArkDrawer.Positioner
    className={positionerStyles({ className })}
    {...props}
  />
);

type DrawerContentProps = ArkDrawer.ContentProps &
  VariantProps<typeof contentStyles>;

export const DrawerContent = ({
  size,
  className,
  ...props
}: DrawerContentProps) => (
  <ArkDrawer.Content
    className={contentStyles({ size, className })}
    {...props}
  />
);

export const DrawerGrabber = ({
  className,
  ...props
}: ArkDrawer.GrabberProps) => (
  <ArkDrawer.Grabber className={styles.grabber({ className })} {...props} />
);

export const DrawerGrabberIndicator = ({
  className,
  ...props
}: ArkDrawer.GrabberIndicatorProps) => (
  <ArkDrawer.GrabberIndicator
    className={styles.grabberIndicator({ className })}
    {...props}
  />
);

// A strip along the edge that starts a swipe even when Content is not
// draggable, for drawers whose body scrolls.
export const DrawerSwipeArea = ({
  className,
  ...props
}: ArkDrawer.SwipeAreaProps) => (
  <ArkDrawer.SwipeArea className={styles.swipeArea({ className })} {...props} />
);

export const DrawerHeader = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) => (
  <div className={shared.header({ className })} {...props} />
);

export const DrawerTitle = ({ className, ...props }: ArkDrawer.TitleProps) => (
  <ArkDrawer.Title className={shared.title({ className })} {...props} />
);

export const DrawerDescription = ({
  className,
  ...props
}: ArkDrawer.DescriptionProps) => (
  <ArkDrawer.Description
    className={shared.description({ className })}
    {...props}
  />
);

export const DrawerBody = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) => (
  <div className={shared.body({ className })} {...props} />
);

export const DrawerFooter = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) => (
  <div className={shared.footer({ className })} {...props} />
);

// Without asChild this is the icon button in the corner; with asChild
// the child (a Button in the footer) keeps its own look.
export const DrawerCloseTrigger = ({
  asChild,
  className,
  ...props
}: ArkDrawer.CloseTriggerProps) => (
  <ArkDrawer.CloseTrigger
    asChild={asChild}
    className={
      asChild === true ? className : shared.closeTrigger({ className })
    }
    {...props}
  />
);
