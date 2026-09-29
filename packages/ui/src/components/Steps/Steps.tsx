'use client';

// The indicator and the progress bar read the step state through Ark's
// context hook, so this is a client component.
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Steps as ArkSteps, useStepsContext } from '@ark-ui/react';
import { Check } from 'lucide-react';
import { tv, type VariantProps } from '../../tv';
import { focusRing } from '../../variants';

// Ark owns the tablist / tab / tabpanel roles, the hidden panels and the
// complete / current / incomplete marks; these parts only style them.
const stepsStyles = tv({
  slots: {
    root: 'flex w-full flex-col gap-6',
    list: 'flex gap-2 ark-vertical:flex-col ark-vertical:gap-0',
    item: [
      'flex flex-1 items-center gap-2 last:flex-none',
      'ark-vertical:flex-col ark-vertical:items-stretch ark-vertical:gap-0',
    ],
    trigger: [
      'inline-flex items-center gap-3 rounded-control py-1 pe-2 text-start',
      'ark-incomplete:base-fg-muted',
      focusRing(),
    ],
    indicator: [
      'inline-flex size-8 shrink-0 items-center justify-center rounded-pill border-2 text-oneline-14 font-bold transition-colors',
      'base-border-solid base-fg-muted',
      'ark-current:primary-border-solid ark-current:primary-fg',
      'ark-complete:primary-border-solid ark-complete:primary-bg-solid ark-complete:primary-fg-contrast',
      '[&>svg]:size-4',
    ],
    title: 'text-oneline-14 font-medium',
    description: 'text-dense-14 base-fg-muted',
    separator: [
      'flex-1 base-bg-muted transition-colors ark-complete:primary-bg-solid',
      'h-0.5 ark-vertical:my-1 ark-vertical:ms-3.75 ark-vertical:h-6 ark-vertical:w-0.5 ark-vertical:flex-none',
    ],
    content: ['rounded-control', focusRing()],
    completedContent: ['rounded-control', focusRing()],
    // Ark hands the percentage to the root as --percent.
    progress: [
      'relative h-1 w-full overflow-hidden rounded-pill base-bg-muted',
      "before:absolute before:inset-y-0 before:left-0 before:w-(--percent) before:primary-bg-solid before:transition-[width] before:duration-transition before:ease-standard before:content-['']",
    ],
  },
  variants: {
    // In linear mode the triggers are not clickable (Ark ignores the
    // click), so they should not invite one.
    linear: {
      true: { trigger: 'cursor-default' },
      false: { trigger: 'cursor-pointer' },
    },
  },
  defaultVariants: { linear: false },
});

const styles = stepsStyles();

export type Step = {
  value: string;
  title: ReactNode;
  description?: ReactNode;
};

type StepsRootProps = Omit<ArkSteps.RootProps, 'count'> &
  VariantProps<typeof stepsStyles> & {
    steps: Step[];
  };

// Ark puts aria-current on the item <div>, which sits between the
// tablist and its tabs and so breaks the required tablist > tab
// ownership. A global ARIA attribute also cancels role="none", and Ark's
// prop merge ignores an undefined override, so the item renders through
// this element, which drops it; the tab carries aria-current instead.
const PresentationalItem = ({
  'aria-current': _ariaCurrent,
  ...props
}: ComponentPropsWithoutRef<'div'>) => <div {...props} role="none" />;

type ItemProps = VariantProps<typeof stepsStyles> & {
  step: Step;
  index: number;
  last: boolean;
};

const Item = ({ step, index, last, linear }: ItemProps) => {
  const { current } = useStepsContext().getItemState({ index });
  return (
    <ArkSteps.Item index={index} className={styles.item()} asChild>
      <PresentationalItem>
        <ArkSteps.Trigger
          aria-current={current ? 'step' : undefined}
          className={styles.trigger({ linear })}
        >
          <Indicator index={index} />
          <span className="flex flex-col">
            <span className={styles.title()}>{step.title}</span>
            {step.description !== undefined && (
              <span className={styles.description()}>{step.description}</span>
            )}
          </span>
        </ArkSteps.Trigger>
        {!last && <ArkSteps.Separator className={styles.separator()} />}
      </PresentationalItem>
    </ArkSteps.Item>
  );
};

const Indicator = ({ index }: { index: number }) => {
  const { completed } = useStepsContext().getItemState({ index });
  return (
    <ArkSteps.Indicator className={styles.indicator()}>
      {completed ? <Check aria-hidden="true" /> : index + 1}
    </ArkSteps.Indicator>
  );
};

export const StepsRoot = ({
  steps,
  linear,
  className,
  children,
  ...props
}: StepsRootProps) => (
  <ArkSteps.Root
    count={steps.length}
    linear={linear}
    className={styles.root({ className })}
    {...props}
  >
    <ArkSteps.List className={styles.list()}>
      {steps.map((step, index) => (
        <Item
          key={step.value}
          step={step}
          index={index}
          last={index === steps.length - 1}
          linear={linear}
        />
      ))}
    </ArkSteps.List>
    {children}
  </ArkSteps.Root>
);

export const StepsContent = ({
  className,
  ...props
}: ArkSteps.ContentProps) => (
  <ArkSteps.Content className={styles.content({ className })} {...props} />
);

export const StepsCompletedContent = ({
  className,
  ...props
}: ArkSteps.CompletedContentProps) => (
  <ArkSteps.CompletedContent
    className={styles.completedContent({ className })}
    {...props}
  />
);

export const StepsPrevTrigger = (props: ArkSteps.PrevTriggerProps) => (
  <ArkSteps.PrevTrigger {...props} />
);

export const StepsNextTrigger = (props: ArkSteps.NextTriggerProps) => (
  <ArkSteps.NextTrigger {...props} />
);

// Ark names the bar "N% complete"; the Japanese text replaces it.
export const StepsProgress = ({
  className,
  ...props
}: ArkSteps.ProgressProps) => {
  const { percent } = useStepsContext();
  return (
    <ArkSteps.Progress
      aria-label="進み具合"
      aria-valuetext={`${Math.round(percent)}%完了`}
      className={styles.progress({ className })}
      {...props}
    />
  );
};
