'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv, type VariantProps } from '../../tv';
import { inputStyles } from '../Input';

const textareaStyles = tv({
  extend: inputStyles,
  base: [
    'min-h-20 resize-y',
    'aria-invalid:error-border-solid',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
});

type TextareaProps = ComponentPropsWithoutRef<'textarea'> &
  VariantProps<typeof inputStyles>;

export const Textarea = ({ size, className, ...props }: TextareaProps) => (
  <textarea className={textareaStyles({ size, className })} {...props} />
);
