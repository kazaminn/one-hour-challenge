'use client';

import { Toggle as ArkToggle } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';

// A single pressable button that keeps its state; Ark owns aria-pressed and
// data-state=on / off. The box and the pressed tint match Button and the
// ToggleGroup items so the two read as one family.
export const toggleStyles = tv({
  extend: focusRing,
  base: [
    'inline-flex items-center justify-center gap-2 rounded-control font-medium base-fg transition-colors',
    'hover:base-bg-subtle',
    'ark-on:primary-bg-muted ark-on:primary-fg',
    'ark-disabled:pointer-events-none ark-disabled:opacity-50',
  ],
  variants: {
    variant: {
      outline: 'border base-border-solid',
      ghost: '',
    },
    size: {
      sm: 'h-8 px-2.5 text-oneline-14',
      md: 'h-10 px-3 text-oneline-14',
      lg: 'h-12 px-4 text-oneline-16',
    },
  },
  defaultVariants: { variant: 'outline', size: 'md' },
});

type ToggleProps = ArkToggle.RootProps & VariantProps<typeof toggleStyles>;

export const Toggle = ({ variant, size, className, ...props }: ToggleProps) => (
  <ArkToggle.Root
    className={toggleStyles({ variant, size, className })}
    {...props}
  />
);
