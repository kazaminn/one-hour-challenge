'use client';

import { Tooltip as ArkTooltip, Portal } from '@ark-ui/react';
import { tv } from '../../tv';

// Ark owns the open / close delays, aria-describedby on the trigger and
// the floating position (written to the positioner's style); these parts
// only style them.
const tooltipStyles = tv({
  slots: {
    positioner: 'z-tooltip',
    content: [
      'max-w-xs rounded-control base-bg-solid px-2.5 py-1.5 text-dense-14 base-fg-contrast shadow-floating',
      'ark-open:animate-fade-in ark-closed:animate-fade-out',
    ],
    // Ark sizes and colors the arrow through these two variables.
    arrow: '[--arrow-background:var(--r-base-bg-solid)] [--arrow-size:8px]',
    arrowTip: '',
  },
});

const styles = tooltipStyles();

const defaultPositioning: ArkTooltip.RootProps['positioning'] = {
  placement: 'top',
  gutter: 8,
};

export const TooltipRoot = ({
  positioning,
  ...props
}: ArkTooltip.RootProps) => (
  <ArkTooltip.Root
    positioning={{ ...defaultPositioning, ...positioning }}
    {...props}
  />
);

export const TooltipTrigger = ArkTooltip.Trigger;

export const TooltipPortal = Portal;

export const TooltipPositioner = ({
  className,
  ...props
}: ArkTooltip.PositionerProps) => (
  <ArkTooltip.Positioner
    className={styles.positioner({ className })}
    {...props}
  />
);

export const TooltipContent = ({
  className,
  ...props
}: ArkTooltip.ContentProps) => (
  <ArkTooltip.Content className={styles.content({ className })} {...props} />
);

export const TooltipArrow = ({
  className,
  ...props
}: ArkTooltip.ArrowProps) => (
  <ArkTooltip.Arrow className={styles.arrow({ className })} {...props}>
    <ArkTooltip.ArrowTip className={styles.arrowTip()} />
  </ArkTooltip.Arrow>
);
