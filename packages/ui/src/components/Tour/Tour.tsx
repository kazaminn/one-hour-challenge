'use client';

// A guided walkthrough: the steps come from useTour, and this renders
// the overlay for whatever step is current, with Japanese labels on
// the built-in controls. Step text and action labels are the app's.
import { Portal } from '@ark-ui/react/portal';
import { Tour as ArkTour, useTour } from '@ark-ui/react/tour';
import { X } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';
import { buttonStyles } from '../Button';

const tourStyles = tv({
  slots: {
    // Ark's TourBackdrop hardcodes `hidden={!step?.backdrop}`, which
    // overrides the presence-driven `hidden` attribute Dialog's backdrop
    // gets on close — so this stays mounted with pointer-events: auto
    // after every close, covering (and freezing) the whole page. Drop
    // pointer-events once `data-state` (which IS presence-driven) flips
    // to closed, independently of that `hidden` attribute.
    backdrop: [
      'fixed inset-0 z-overlay bg-(--r-base-fg-strong)/50',
      'ark-open:animate-fade-in ark-closed:pointer-events-none ark-closed:animate-fade-out',
    ],
    spotlight: 'rounded-control',
    // For a `dialog` step, `z-modal` is what actually positions this
    // above the backdrop. For a `tooltip` step, Ark instead sets its own
    // `z-index: var(--z-index)` inline, computed from
    // `--tour-layer + --tour-z-index` — and never defines
    // `--tour-z-index` itself. Left undefined, that `calc()` is invalid,
    // so `z-index` resolves to `auto`: the positioner (and its "次へ"/
    // "戻る" actions) then paints *below* the backdrop's own stacking
    // context and can't be clicked. Defining `--tour-z-index` here (at
    // the same layer as the dialog case, `z-modal`) fixes both.
    positioner: [
      'z-modal [--tour-z-index:var(--z-index-modal)]',
      'data-[type=dialog]:fixed data-[type=dialog]:inset-0 data-[type=dialog]:flex data-[type=dialog]:items-center data-[type=dialog]:justify-center',
    ],
    content: [
      'relative flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-overlay base-bg p-5 base-fg shadow-overlay',
      '[--arrow-background:var(--r-base-bg)] [--arrow-size:10px]',
      'ark-open:animate-scale-in ark-closed:animate-scale-out',
    ],
    arrowTip: 'border-t border-l base-border-muted',
    progress: 'text-dense-14 base-fg-muted',
    title: 'text-body-18 font-semibold base-fg-strong',
    description: 'text-dense-14 base-fg-muted',
    control: 'mt-3 flex items-center gap-2',
    closeTrigger: [
      'absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-control base-fg-muted',
      'hover:base-bg-subtle hover:base-fg-strong',
      focusRing(),
    ],
  },
});

const styles = tourStyles();

const defaultTranslations: NonNullable<
  Parameters<typeof useTour>[0]
>['translations'] = {
  // Ark counts steps from 0; people count from 1.
  progressText: ({ current, total }) => `${current + 1} / ${total}`,
  nextStep: '次へ',
  prevStep: '戻る',
  close: '閉じる',
  skip: 'スキップ',
};

export type TourStep = ArkTour.StepDetails;

// Wraps useTour with the Japanese labels; the app supplies steps whose
// `actions` name the buttons (次へ, 戻る, 完了).
export const useAppTour = (
  props: Parameters<typeof useTour>[0],
): ReturnType<typeof useTour> =>
  useTour({
    ...props,
    translations: { ...defaultTranslations, ...props?.translations },
  });

type TourProps = {
  tour: ReturnType<typeof useTour>;
};

export const Tour = ({ tour }: TourProps) => (
  <ArkTour.Root tour={tour}>
    <Portal>
      <ArkTour.Backdrop className={styles.backdrop()} />
      <ArkTour.Spotlight className={styles.spotlight()} />
      <ArkTour.Positioner className={styles.positioner()}>
        <ArkTour.Content className={styles.content()}>
          <ArkTour.Arrow>
            <ArkTour.ArrowTip className={styles.arrowTip()} />
          </ArkTour.Arrow>
          <ArkTour.ProgressText className={styles.progress()} />
          <ArkTour.Title className={styles.title()} />
          <ArkTour.Description className={styles.description()} />
          <ArkTour.Control className={styles.control()}>
            <ArkTour.Actions>
              {(actions) =>
                actions.map((action, index) => (
                  <ArkTour.ActionTrigger
                    key={action.label}
                    action={action}
                    // Ark names the button by its kind (次へ, 戻る); the
                    // visible label is what the reader should hear.
                    aria-label={action.label}
                    className={buttonStyles({
                      size: 'sm',
                      variant:
                        index === actions.length - 1 ? 'primary' : 'outline',
                    })}
                  />
                ))
              }
            </ArkTour.Actions>
          </ArkTour.Control>
          <ArkTour.CloseTrigger className={styles.closeTrigger()}>
            <X aria-hidden="true" className="size-4" />
          </ArkTour.CloseTrigger>
        </ArkTour.Content>
      </ArkTour.Positioner>
    </Portal>
  </ArkTour.Root>
);
