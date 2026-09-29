'use client';

import type { ComponentPropsWithRef } from 'react';
import { ark } from '@ark-ui/react';
import { tv, type VariantProps } from '../../tv';

export const headingStyles = tv({
  base: 'font-bold base-fg-strong',
  variants: {
    size: {
      'display-64': 'text-display-64',
      'display-56': 'text-display-56',
      'display-48': 'text-display-48',
      'display-44': 'text-display-44',
      'highlight-36': 'text-highlight-36',
      'highlight-32': 'text-highlight-32',
      'highlight-28': 'text-highlight-28',
      'highlight-26': 'text-highlight-26',
      'highlight-24': 'text-highlight-24',
      'highlight-22': 'text-highlight-22',
      'body-18': 'text-body-18',
      'body-16': 'text-body-16',
    },
  },
});

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = NonNullable<VariantProps<typeof headingStyles>['size']>;

// The level decides the element; the size follows it unless overridden,
// so the visual scale and the document outline can differ on purpose.
const defaultSizes: Record<HeadingLevel, HeadingSize> = {
  1: 'highlight-32',
  2: 'highlight-28',
  3: 'highlight-24',
  4: 'highlight-22',
  5: 'body-18',
  6: 'body-16',
};

// `ref` is a prop (React 19), so a page can move focus to the heading.
type HeadingProps = ComponentPropsWithRef<typeof ark.h2> &
  VariantProps<typeof headingStyles> & {
    level?: HeadingLevel;
  };

export const Heading = ({
  level = 2,
  size,
  className,
  ...props
}: HeadingProps) => {
  const Tag = ark[`h${level}`];
  return (
    <Tag
      className={headingStyles({
        size: size ?? defaultSizes[level],
        className,
      })}
      {...props}
    />
  );
};
