'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';

// The text control recipe, shared with Textarea and Field: box, colors and
// size. State styling is added by each component for the attribute it
// actually carries (native aria-invalid here, Ark's data-invalid in Field).
export const inputStyles = tv({
  extend: focusRing,
  base: [
    'w-full rounded-control border base-border-muted base-bg base-fg',
    'placeholder:base-fg-muted',
  ],
  variants: {
    size: {
      sm: 'px-2.5 py-1.5 text-dense-14',
      md: 'px-3 py-2 text-body-16',
      lg: 'px-4 py-3 text-body-16',
    },
  },
  defaultVariants: { size: 'md' },
});

const nativeInputStyles = tv({
  extend: inputStyles,
  base: [
    'aria-invalid:error-border-solid',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
});

// `size` is the visual size; the native character-count attribute is dropped.
type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'size'> &
  VariantProps<typeof inputStyles>;

export const Input = ({ size, className, ...props }: InputProps) => (
  <input className={nativeInputStyles({ size, className })} {...props} />
);
