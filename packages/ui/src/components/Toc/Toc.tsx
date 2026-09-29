'use client';

// Ark tracks which headings are on screen and hands the items through a
// render-prop context, so this wrapper renders the whole nav itself.
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Toc as ArkToc } from '@ark-ui/react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

const tocStyles = tv({
  slots: {
    root: 'relative',
    nav: '',
    title: 'mb-2 text-oneline-14 font-bold base-fg-muted uppercase',
    list: 'flex flex-col gap-0.5 border-s base-border-muted',
    // Ark writes the depth to --depth; every level indents by one step.
    item: 'ps-[calc(var(--depth)*0.75rem)]',
    link: [
      '-ms-px block border-s-2 border-transparent px-3 py-1 text-dense-14 base-fg-muted no-underline transition-colors',
      'hover:base-fg-strong',
      'ark-active:primary-border-solid ark-active:primary-fg',
      focusRing(),
    ],
  },
});

const styles = tocStyles();

export type TocEntry = {
  // The id of the heading element the link scrolls to.
  value: string;
  depth: number;
  label: string;
};

// Ark's observer settings don't apply: the current heading is tracked here.
type TocProps = Omit<
  ArkToc.RootProps,
  'items' | 'children' | 'rootMargin' | 'threshold'
> & {
  items: TocEntry[];
  title?: string;
};

// A heading becomes current once its top passes this fraction of the
// scroll area's height.
const READING_LINE = 0.25;

// Ark marks every heading inside its observer band, and keeps the old one
// when none is; scrolling up into a long section then leaves the section
// below it highlighted. This picks one heading instead: the last whose
// top has passed the reading line, or the last one at the very bottom,
// where short final sections can never reach the line.
const useCurrentHeading = (
  items: TocEntry[],
  scrollEl: TocProps['scrollEl'],
  initial: string | undefined,
  onActiveChange: TocProps['onActiveChange'],
) => {
  const [current, setCurrent] = useState(initial);
  const getScrollEl = useEffectEvent(() => scrollEl?.() ?? undefined);
  const notify = useEffectEvent((id: string) => {
    onActiveChange?.({
      activeIds: [id],
      activeItems: items.filter((item) => item.value === id),
    });
  });

  const reported = useRef(initial);
  useEffect(() => {
    if (current === undefined || current === reported.current) return;
    reported.current = current;
    notify(current);
  }, [current]);

  useEffect(() => {
    const container = getScrollEl();
    const target: HTMLElement | Window = container ?? window;
    let frame = 0;

    const update = () => {
      frame = 0;
      const headings = items
        .map((item) => document.getElementById(item.value))
        .filter((el) => el !== null);
      if (headings.length === 0) return;

      const top = container?.getBoundingClientRect().top ?? 0;
      const height = container?.clientHeight ?? window.innerHeight;
      const scrolled = container?.scrollTop ?? window.scrollY;
      const scrollHeight =
        container?.scrollHeight ?? document.documentElement.scrollHeight;

      let next: HTMLElement | undefined = headings[0];
      if (scrolled + height >= scrollHeight - 1) {
        next = headings.at(-1);
      } else {
        const line = top + height * READING_LINE;
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top <= line) next = heading;
        }
      }
      setCurrent(next?.id);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    target.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [items]);

  return current;
};

export const Toc = ({
  items,
  title = '目次',
  className,
  activeIds,
  defaultActiveIds,
  scrollEl,
  onActiveChange,
  ...props
}: TocProps) => {
  const current = useCurrentHeading(
    items,
    scrollEl,
    defaultActiveIds?.[0],
    onActiveChange,
  );
  return (
    <ArkToc.Root
      items={items}
      activeIds={activeIds ?? (current === undefined ? [] : [current])}
      scrollEl={scrollEl}
      className={styles.root({ className })}
      // Ark's default auto-scroll calls the active link's native
      // `scrollIntoView`, which also walks up every scrollable ancestor —
      // including `#main`, the page's own scroll container — and drags it
      // back toward the top every time the active heading changes while
      // the reader scrolls. The nav list is short enough to not need
      // auto-scrolling itself, so this turns the whole feature off rather
      // than fight the page scroll.
      autoScroll={false}
      {...props}
    >
      <ArkToc.Nav className={styles.nav()}>
        <ArkToc.Title className={styles.title()}>{title}</ArkToc.Title>
        <ArkToc.List className={styles.list()}>
          {items.map((item) => (
            <ArkToc.Item key={item.value} item={item} className={styles.item()}>
              <ArkToc.Link href={`#${item.value}`} className={styles.link()}>
                {item.label}
              </ArkToc.Link>
            </ArkToc.Item>
          ))}
        </ArkToc.List>
      </ArkToc.Nav>
    </ArkToc.Root>
  );
};
