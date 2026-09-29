'use client';

import type { LucideIcon, LucideProps } from 'lucide-react';
import { tv, type VariantProps } from '../../tv';

export const iconStyles = tv({
  base: 'shrink-0',
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-3.5',
      md: 'size-4',
      lg: 'size-5',
      xl: 'size-6',
    },
  },
  defaultVariants: { size: 'md' },
});

export type IconProps = Omit<LucideProps, 'size' | 'ref'> &
  VariantProps<typeof iconStyles> & {
    icon: LucideIcon;
    // Names the icon for assistive technology; without it the icon is
    // decorative and hidden.
    label?: string;
  };

export const Icon = ({
  icon: Component,
  size,
  label,
  className,
  ...props
}: IconProps) => {
  const decorative = label === undefined;

  return (
    <Component
      role={decorative ? undefined : 'img'}
      aria-label={label}
      aria-hidden={decorative}
      className={iconStyles({ size, className })}
      {...props}
    />
  );
};
