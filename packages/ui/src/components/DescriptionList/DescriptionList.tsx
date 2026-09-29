'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { tv, type VariantProps } from '../../tv';

const descriptionListStyles = tv({
  slots: {
    // Only Root reads orientation; the parts are placed by its grid.
    root: 'grid text-body-16',
    term: 'text-dense-14 font-medium base-fg-muted',
    description: 'base-fg',
  },
  variants: {
    orientation: {
      // space between groups, not between a term and its description
      vertical: { root: 'gap-y-1 [&>dd+dt]:mt-3' },
      horizontal: {
        root: 'grid-cols-[max-content_1fr] items-baseline gap-x-6 gap-y-2',
      },
    },
  },
  defaultVariants: { orientation: 'vertical' },
});

type DescriptionListRootProps = ComponentPropsWithoutRef<'dl'> &
  VariantProps<typeof descriptionListStyles>;

export const DescriptionListRoot = ({
  orientation,
  className,
  ...props
}: DescriptionListRootProps) => (
  <dl
    className={descriptionListStyles({ orientation }).root({ className })}
    {...props}
  />
);

export const DescriptionListTerm = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'dt'>) => (
  <dt className={descriptionListStyles().term({ className })} {...props} />
);

export const DescriptionListDescription = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'dd'>) => (
  <dd
    className={descriptionListStyles().description({ className })}
    {...props}
  />
);
