'use client';

// Ark hands the page list over through a render-prop context, so this
// wrapper renders the whole control itself and is the interactive leaf.
import React from 'react';
import { Pagination as ArkPagination } from '@ark-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

const paginationStyles = tv({
  slots: {
    root: 'flex flex-wrap items-center gap-1',
    // shared by the page items and the prev / next triggers
    control: [
      'inline-flex h-9 min-w-9 items-center justify-center rounded-control px-2',
      'text-oneline-14 font-medium base-fg transition-colors',
      'hover:base-bg-subtle',
      'ark-selected:primary-bg-solid ark-selected:primary-fg-contrast',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      'disabled:pointer-events-none disabled:opacity-50',
      focusRing(),
    ],
    ellipsis:
      'inline-flex h-9 min-w-9 items-center justify-center base-fg-muted',
  },
});

const styles = paginationStyles();

const defaultTranslations: ArkPagination.RootProps['translations'] = {
  rootLabel: 'ページネーション',
  prevTriggerLabel: '前のページ',
  nextTriggerLabel: '次のページ',
  firstTriggerLabel: '最初のページ',
  lastTriggerLabel: '最後のページ',
  itemLabel: ({ page, totalPages }) =>
    `${page}ページ目（全${totalPages}ページ）`,
};

type PaginationProps = Omit<ArkPagination.RootProps, 'children'>;

// With type="link" Ark supplies an href per page, so each control becomes
// an <a> through asChild; otherwise Ark renders <button>s. The prev/next
// trigger drops its href at a boundary (page 1, last page) but still
// carries an aria-label — an <a> with no href has no implicit role, so
// axe flags aria-label as a prohibited attribute. Giving it role="link"
// back restores a valid host for the label, and aria-disabled announces
// it as unavailable instead of just silently doing nothing on click.
const Anchor = ({
  href,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'a'>) =>
  href === undefined ? (
    <a role="link" aria-disabled="true" {...props}>
      {children}
    </a>
  ) : (
    <a href={href} {...props}>
      {children}
    </a>
  );

export const Pagination = ({
  className,
  translations,
  type = 'button',
  ...props
}: PaginationProps) => {
  const isLink = type === 'link';
  const Wrap = isLink ? Anchor : React.Fragment;

  return (
    <ArkPagination.Root
      className={styles.root({ className })}
      translations={{ ...defaultTranslations, ...translations }}
      type={type}
      {...props}
    >
      <ArkPagination.PrevTrigger asChild={isLink} className={styles.control()}>
        <Wrap>
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Wrap>
      </ArkPagination.PrevTrigger>
      <ArkPagination.Context>
        {(pagination) =>
          pagination.pages.map((page, index) =>
            page.type === 'page' ? (
              <ArkPagination.Item
                key={index}
                asChild={isLink}
                className={styles.control()}
                {...page}
              >
                <Wrap>{page.value}</Wrap>
              </ArkPagination.Item>
            ) : (
              <ArkPagination.Ellipsis
                key={index}
                index={index}
                className={styles.ellipsis()}
              >
                …
              </ArkPagination.Ellipsis>
            ),
          )
        }
      </ArkPagination.Context>
      <ArkPagination.NextTrigger asChild={isLink} className={styles.control()}>
        <Wrap>
          <ChevronRight aria-hidden="true" className="size-4" />
        </Wrap>
      </ArkPagination.NextTrigger>
    </ArkPagination.Root>
  );
};
