'use client';

// Ark hands the item list over through a render-prop context, so the
// wrapper renders the whole control: a radio group of stars.
import type { ReactNode } from 'react';
import { RatingGroup as ArkRatingGroup } from '@ark-ui/react/rating-group';
import { Star } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

const ratingGroupStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5 ark-readonly:pointer-events-none',
    label: 'text-dense-14 font-medium base-fg-strong',
    control: 'inline-flex items-center gap-0.5',
    item: [
      'relative inline-flex cursor-pointer rounded-tight',
      'ark-disabled:cursor-not-allowed ark-disabled:opacity-50',
      focusRing(),
    ],
    // Two stars on top of each other: the muted outline, and the filled
    // one clipped to none, half or all of its width by the item state.
    star: 'size-6 shrink-0 base-fg-subtle',
    fill: [
      'absolute inset-0 size-6 fill-current warning-fg',
      '[clip-path:inset(0_100%_0_0)]',
      'ark-highlighted:[clip-path:inset(0_0_0_0)]',
      'ark-half:[clip-path:inset(0_50%_0_0)]',
    ],
  },
});

const styles = ratingGroupStyles();

type RatingGroupProps = Omit<ArkRatingGroup.RootProps, 'children'> & {
  label?: ReactNode;
};

const defaultTranslations: ArkRatingGroup.RootProps['translations'] = {
  ratingValueText: (index) => `${index}つ星`,
};

export const RatingGroup = ({
  label,
  count = 5,
  translations,
  className,
  ...props
}: RatingGroupProps) => (
  <ArkRatingGroup.Root
    count={count}
    translations={{ ...defaultTranslations, ...translations }}
    className={styles.root({ className })}
    {...props}
  >
    {label !== undefined && (
      <ArkRatingGroup.Label className={styles.label()}>
        {label}
      </ArkRatingGroup.Label>
    )}
    <ArkRatingGroup.Control className={styles.control()}>
      <ArkRatingGroup.Context>
        {({ items }) =>
          items.map((index) => (
            <ArkRatingGroup.Item
              key={index}
              index={index}
              className={styles.item()}
            >
              <Star aria-hidden="true" className={styles.star()} />
              <Star aria-hidden="true" className={styles.fill()} />
            </ArkRatingGroup.Item>
          ))
        }
      </ArkRatingGroup.Context>
      <ArkRatingGroup.HiddenInput />
    </ArkRatingGroup.Control>
  </ArkRatingGroup.Root>
);
