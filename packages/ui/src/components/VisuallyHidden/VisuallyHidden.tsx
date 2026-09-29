'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { ark } from '@ark-ui/react';
import { tv } from '../../tv';

const visuallyHiddenStyles = tv({ base: 'sr-only' });

// Read by assistive technology, invisible on screen. `asChild` applies it
// to any element, e.g. a heading that only screen readers should get.
export const VisuallyHidden = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof ark.span>) => (
  <ark.span className={visuallyHiddenStyles({ className })} {...props} />
);
