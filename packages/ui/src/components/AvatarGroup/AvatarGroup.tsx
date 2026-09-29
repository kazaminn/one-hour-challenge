'use client';

import {
  Children,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { tv, type VariantProps } from '../../tv';

const avatarGroupStyles = tv({
  slots: {
    root: 'm-0 inline-flex list-none items-center p-0',
    item: 'inline-flex rounded-pill ring-2 ring-(--r-base-bg)',
    overflow:
      'inline-flex shrink-0 items-center justify-center rounded-pill base-bg-muted font-medium base-fg',
  },
  variants: {
    size: {
      xs: { root: '-space-x-1.5', overflow: 'size-6 text-oneline-14' },
      sm: { root: '-space-x-2', overflow: 'size-8 text-oneline-14' },
      md: { root: '-space-x-2.5', overflow: 'size-10 text-oneline-16' },
      lg: { root: '-space-x-3', overflow: 'size-12 text-oneline-18' },
      xl: { root: '-space-x-4', overflow: 'size-16 text-highlight-22' },
    },
  },
  defaultVariants: { size: 'md' },
});

// Reads the `name` an Avatar child was given, so the overflow item can name
// who it is hiding instead of leaving "+N" as the only clue.
const nameOf = (item: ReactNode): string | undefined => {
  if (!isValidElement<{ name?: unknown }>(item)) return undefined;
  return typeof item.props.name === 'string' ? item.props.name : undefined;
};

type AvatarGroupProps = ComponentPropsWithoutRef<'ul'> &
  VariantProps<typeof avatarGroupStyles> & {
    max?: number;
    children: ReactNode;
  };

export const AvatarGroup = ({
  max,
  size,
  className,
  children,
  ...props
}: AvatarGroupProps) => {
  const styles = avatarGroupStyles({ size });
  const items = Children.toArray(children);
  const shown = max === undefined ? items : items.slice(0, max);
  const hiddenItems = items.slice(shown.length);
  const hidden = hiddenItems.length;
  const hiddenNames = hiddenItems
    .map(nameOf)
    .filter((name): name is string => name !== undefined);
  const overflowLabel =
    hiddenNames.length === hidden
      ? `ほか${hidden}人: ${hiddenNames.join('、')}`
      : `ほか${hidden}人`;

  return (
    <ul className={styles.root({ className })} {...props}>
      {shown.map((item, index) => (
        <li key={index} className={styles.item()}>
          {item}
        </li>
      ))}
      {hidden > 0 && (
        <li className={styles.item({ className: styles.overflow() })}>
          <span aria-hidden="true">+{hidden}</span>
          {/* Text, not aria-label: screen readers often skip a named <li>. */}
          <span className="sr-only">{overflowLabel}</span>
        </li>
      )}
    </ul>
  );
};
