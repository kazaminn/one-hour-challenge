'use client';

// The value text reads the current value through Ark's context render
// prop, so this is a client component.
import type { KeyboardEvent, ReactNode } from 'react';
import { Slider as ArkSlider, useSliderContext } from '@ark-ui/react';
import { tv } from '../../tv';
import { focusRing } from '../../variants';

// Ark owns the slider role, aria-value*, the keyboard steps and the thumb /
// range offsets (inline --slider-* variables); these parts only style them.
// The vertical layout needs a fixed height for Ark to measure against.
const sliderStyles = tv({
  slots: {
    root: 'flex w-full flex-col gap-1.5 ark-disabled:opacity-50',
    header: 'flex items-baseline justify-between gap-3',
    label: 'text-dense-14 font-medium base-fg-strong',
    valueText: 'font-mono text-mono-14 base-fg-muted',
    body: 'flex',
    control: 'flex items-center',
    track:
      'cursor-pointer rounded-pill base-bg-muted ark-disabled:cursor-not-allowed',
    range: 'inset-0 rounded-pill primary-bg-solid',
    thumb: [
      'size-5 cursor-grab rounded-pill border-2 primary-border-solid base-bg shadow-flat',
      'ark-disabled:cursor-not-allowed ark-dragging:cursor-grabbing',
      focusRing(),
    ],
    markerGroup: '',
    marker: [
      'text-oneline-14 base-fg-muted',
      "before:absolute before:size-1 before:rounded-pill before:base-bg-solid before:content-['']",
    ],
  },
  variants: {
    orientation: {
      horizontal: {
        body: 'flex-col gap-1',
        control: 'h-5 w-full',
        track: 'h-1.5 flex-1',
        thumb: 'top-0',
        markerGroup: 'h-5 w-full',
        marker: 'top-1 before:-top-2 before:left-1/2 before:-translate-x-1/2',
      },
      vertical: {
        root: 'h-56 w-fit',
        body: 'flex-1 flex-row gap-2',
        control: 'h-full w-5 flex-col',
        track: 'w-1.5 flex-1',
        thumb: 'left-0',
        markerGroup: 'h-full w-8',
        marker: 'left-2 before:top-1/2 before:-left-2 before:-translate-y-1/2',
      },
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

// Matches the thumb's size-5 so Ark need not measure it before the
// first paint (thumbs stay hidden until measured otherwise).
const THUMB_SIZE = { width: 20, height: 20 };

type SliderProps = Omit<ArkSlider.RootProps, 'children'> & {
  label?: ReactNode;
  showValueText?: boolean;
  formatValue?: (value: number[]) => string;
  markers?: number[];
};

const joinValue = (value: number[]): string => value.join(' – ');

// The WAI-ARIA slider pattern has Up/Right increase and Down/Left
// decrease whatever the orientation, but zag only handles the keys along
// the slider's own axis. This fills in the other axis; zag ignores
// these keys, so nothing is handled twice.
const CROSS_AXIS_KEYS = {
  horizontal: { ArrowUp: 1, ArrowDown: -1 },
  vertical: { ArrowRight: 1, ArrowLeft: -1 },
} as const;

type ThumbProps = {
  index: number;
  orientation: keyof typeof CROSS_AXIS_KEYS;
  step: number;
  largeStep: number;
  className: string;
};

const Thumb = ({
  index,
  orientation,
  step,
  largeStep,
  className,
}: ThumbProps) => {
  const slider = useSliderContext();
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const keys: Partial<Record<string, number>> = CROSS_AXIS_KEYS[orientation];
    const direction = keys[event.key];
    const current = slider.value[index];
    if (direction === undefined || current === undefined) return;
    if (event.defaultPrevented) return;
    event.preventDefault();
    // Same step sizes as zag's own arrow keys; zag clamps and snaps.
    const delta = (event.shiftKey ? largeStep : step) * direction;
    slider.setThumbValue(index, current + delta);
  };
  return (
    <ArkSlider.Thumb
      index={index}
      className={className}
      onKeyDown={handleKeyDown}
    >
      <ArkSlider.HiddenInput />
    </ArkSlider.Thumb>
  );
};

export const Slider = ({
  label,
  showValueText = false,
  formatValue = joinValue,
  markers,
  min = 0,
  step = 1,
  largeStep = step * 10,
  value,
  defaultValue,
  orientation = 'horizontal',
  className,
  ...props
}: SliderProps) => {
  const styles = sliderStyles({ orientation });
  // One thumb per value; a bare slider starts with one at the minimum.
  const values = value ?? defaultValue ?? [min];

  return (
    <ArkSlider.Root
      min={min}
      step={step}
      largeStep={largeStep}
      value={value}
      defaultValue={values}
      orientation={orientation}
      thumbSize={THUMB_SIZE}
      className={styles.root({ className })}
      {...props}
    >
      {(label !== undefined || showValueText) && (
        <div className={styles.header()}>
          {label !== undefined && (
            <ArkSlider.Label className={styles.label()}>
              {label}
            </ArkSlider.Label>
          )}
          {showValueText && (
            <ArkSlider.Context>
              {(slider) => (
                <ArkSlider.ValueText className={styles.valueText()}>
                  {formatValue(slider.value)}
                </ArkSlider.ValueText>
              )}
            </ArkSlider.Context>
          )}
        </div>
      )}
      <div className={styles.body()}>
        <ArkSlider.Control className={styles.control()}>
          <ArkSlider.Track className={styles.track()}>
            <ArkSlider.Range className={styles.range()} />
          </ArkSlider.Track>
          {values.map((_, index) => (
            <Thumb
              // thumbs are positional: the index is the identity Ark uses
              key={index}
              index={index}
              orientation={orientation}
              step={step}
              largeStep={largeStep}
              className={styles.thumb()}
            />
          ))}
        </ArkSlider.Control>
        {markers !== undefined && markers.length > 0 && (
          <ArkSlider.MarkerGroup className={styles.markerGroup()}>
            {markers.map((marker) => (
              <ArkSlider.Marker
                key={marker}
                value={marker}
                className={styles.marker()}
              >
                {marker}
              </ArkSlider.Marker>
            ))}
          </ArkSlider.MarkerGroup>
        )}
      </div>
    </ArkSlider.Root>
  );
};
