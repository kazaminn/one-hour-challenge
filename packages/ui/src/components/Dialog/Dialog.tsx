'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { Dialog as ArkDialog, Portal } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';

// Ark owns open state, focus trap, aria-modal / labelledby / describedby
// and Escape / outside-click dismissal; these parts only style them.
// Each part carries its own variants, so no context is needed.
const positionerStyles = tv({
  base: 'fixed inset-0 z-modal flex justify-center p-4',
  variants: {
    placement: {
      center: 'items-center',
      top: 'items-start pt-16',
    },
    // where a tall dialog scrolls: its own body, or the page behind
    scrollBehavior: {
      inside: '',
      outside: 'overflow-y-auto',
    },
  },
  defaultVariants: { placement: 'center', scrollBehavior: 'inside' },
});

const contentStyles = tv({
  base: [
    'relative flex w-full flex-col rounded-overlay base-bg base-fg shadow-overlay',
    'ark-open:animate-scale-in ark-closed:animate-scale-out',
  ],
  variants: {
    size: {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-3xl',
      full: 'h-full max-w-none rounded-none',
    },
    scrollBehavior: {
      inside: 'max-h-full',
      outside: '',
    },
  },
  defaultVariants: { size: 'md', scrollBehavior: 'inside' },
});

// Exported so Drawer shares the header, body, footer and close styling.
export const dialogStyles = tv({
  slots: {
    backdrop: [
      'fixed inset-0 z-overlay bg-(--r-base-fg-strong)/50',
      'ark-open:animate-fade-in ark-closed:animate-fade-out',
    ],
    header: 'flex flex-col gap-1 px-6 pt-6',
    title: 'text-highlight-22 font-bold base-fg-strong',
    description: 'text-dense-14 base-fg-muted',
    body: 'min-h-0 flex-1 overflow-y-auto px-6 py-4 text-body-16',
    footer: 'flex items-center justify-end gap-3 px-6 pb-6',
    closeTrigger: [
      'absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-control base-fg-muted',
      'hover:base-bg-subtle hover:base-fg-strong',
      focusRing(),
    ],
  },
});

const styles = dialogStyles();

export const DialogRoot = ArkDialog.Root;

export const DialogTrigger = ArkDialog.Trigger;

// Renders the positioner at the end of <body>, above the page's stacking.
export const DialogPortal = Portal;

export const DialogBackdrop = ({
  className,
  ...props
}: ArkDialog.BackdropProps) => (
  <ArkDialog.Backdrop className={styles.backdrop({ className })} {...props} />
);

type DialogPositionerProps = ArkDialog.PositionerProps &
  VariantProps<typeof positionerStyles>;

export const DialogPositioner = ({
  placement,
  scrollBehavior,
  className,
  ...props
}: DialogPositionerProps) => (
  <ArkDialog.Positioner
    className={positionerStyles({ placement, scrollBehavior, className })}
    {...props}
  />
);

type DialogContentProps = ArkDialog.ContentProps &
  VariantProps<typeof contentStyles>;

export const DialogContent = ({
  size,
  scrollBehavior,
  className,
  ...props
}: DialogContentProps) => (
  <ArkDialog.Content
    className={contentStyles({ size, scrollBehavior, className })}
    {...props}
  />
);

export const DialogHeader = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={styles.header({ className })} {...props} />
);

export const DialogTitle = ({ className, ...props }: ArkDialog.TitleProps) => (
  <ArkDialog.Title className={styles.title({ className })} {...props} />
);

export const DialogDescription = ({
  className,
  ...props
}: ArkDialog.DescriptionProps) => (
  <ArkDialog.Description
    className={styles.description({ className })}
    {...props}
  />
);

export const DialogBody = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={styles.body({ className })} {...props} />
);

export const DialogFooter = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={styles.footer({ className })} {...props} />
);

// Without asChild this is the icon button in the corner; with asChild
// the child (a Button in the footer) keeps its own look.
export const DialogCloseTrigger = ({
  asChild,
  className,
  ...props
}: ArkDialog.CloseTriggerProps) => (
  <ArkDialog.CloseTrigger
    asChild={asChild}
    className={
      asChild === true ? className : styles.closeTrigger({ className })
    }
    {...props}
  />
);
