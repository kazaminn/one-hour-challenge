'use client';

// A hex field with a swatch button that opens the picker: a saturation
// area, hue and alpha sliders, an eyedropper where the browser has one,
// and optional preset swatches. Ark owns the color model and the
// keyboard handling; the wrapper names every part in Japanese.
import { useId, type ReactNode } from 'react';
import {
  ColorPicker as ArkColorPicker,
  parseColor,
} from '@ark-ui/react/color-picker';
import { Portal } from '@ark-ui/react/portal';
import { Check, Pipette } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing, menuListStyles } from '../../variants';
import { inputStyles } from '../Input';
import { VisuallyHidden } from '../VisuallyHidden';

const colorPickerStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    control: 'flex items-center gap-2',
    input: [
      inputStyles(),
      'min-w-0 flex-1 font-mono',
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
    ],
    trigger: [
      'grid size-10 shrink-0 place-items-center overflow-hidden rounded-control border base-border-muted',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      focusRing(),
    ],
    swatch: 'relative grid size-full place-items-center [&>*]:[grid-area:1/1]',
    swatchLayer: 'size-full',
    content: 'flex max-h-none w-64 flex-col gap-3 p-4',
    area: 'relative h-40 touch-none overflow-hidden rounded-control',
    areaBackground: 'size-full rounded-control',
    thumb: [
      'size-3 -translate-x-1/2 -translate-y-1/2 rounded-pill border-2 border-white shadow-raised outline-none',
      'focus-visible:ring-2 focus-visible:ring-(--r-primary-focus-ring)',
    ],
    sliders: 'flex items-center gap-3',
    sliderGroup: 'flex flex-1 flex-col gap-2.5',
    slider: 'relative h-2.5 rounded-pill',
    sliderTrack: 'h-2.5 w-full rounded-pill',
    eyeDropper: [
      'inline-flex size-10 shrink-0 items-center justify-center rounded-control border base-border-muted base-fg-muted [&>svg]:size-4',
      'hover:base-bg-subtle hover:base-fg-strong',
      focusRing(),
    ],
    presets: 'flex flex-wrap gap-2',
    presetTrigger: [
      'grid size-8 place-items-center overflow-hidden rounded-control border base-border-muted',
      focusRing(),
    ],
    presetIndicator: 'text-white drop-shadow [&>svg]:size-4',
  },
});

const styles = colorPickerStyles();
const list = menuListStyles();

type ColorPickerProps = Omit<ArkColorPicker.RootProps, 'children'> & {
  label?: ReactNode;
  presets?: string[];
  alpha?: boolean;
};

export const ColorPicker = ({
  label,
  presets,
  alpha = false,
  className,
  ...props
}: ColorPickerProps) => {
  // Ark labels the trigger by the field label; the button is named by
  // its own purpose instead.
  const triggerLabelId = useId();
  return (
    <ArkColorPicker.Root className={styles.root({ className })} {...props}>
      {label !== undefined && (
        <ArkColorPicker.Label className={styles.label()}>
          {label}
        </ArkColorPicker.Label>
      )}
      <ArkColorPicker.Control className={styles.control()}>
        <ArkColorPicker.ChannelInput
          channel="hex"
          aria-label="16進数の色"
          className={styles.input()}
        />
        <ArkColorPicker.Trigger
          aria-labelledby={triggerLabelId}
          className={styles.trigger()}
        >
          <VisuallyHidden id={triggerLabelId}>色を選ぶ</VisuallyHidden>
          <span className={styles.swatch()}>
            <ArkColorPicker.TransparencyGrid className={styles.swatchLayer()} />
            <ArkColorPicker.ValueSwatch className={styles.swatchLayer()} />
          </span>
        </ArkColorPicker.Trigger>
      </ArkColorPicker.Control>
      <Portal>
        <ArkColorPicker.Positioner className={list.positioner()}>
          <ArkColorPicker.Content
            className={list.content({ className: styles.content() })}
          >
            <ArkColorPicker.Area className={styles.area()}>
              <ArkColorPicker.AreaBackground
                className={styles.areaBackground()}
              />
              <ArkColorPicker.AreaThumb
                aria-label="彩度と明度"
                className={styles.thumb()}
              />
            </ArkColorPicker.Area>
            <div className={styles.sliders()}>
              <ArkColorPicker.EyeDropperTrigger
                aria-label="画面から色を拾う"
                className={styles.eyeDropper()}
              >
                <Pipette aria-hidden="true" />
              </ArkColorPicker.EyeDropperTrigger>
              <div className={styles.sliderGroup()}>
                <ArkColorPicker.ChannelSlider
                  channel="hue"
                  className={styles.slider()}
                >
                  <ArkColorPicker.ChannelSliderTrack
                    className={styles.sliderTrack()}
                  />
                  <ArkColorPicker.ChannelSliderThumb
                    aria-label="色相"
                    className={styles.thumb()}
                  />
                </ArkColorPicker.ChannelSlider>
                {alpha && (
                  <ArkColorPicker.ChannelSlider
                    channel="alpha"
                    className={styles.slider()}
                  >
                    <ArkColorPicker.TransparencyGrid
                      className={styles.sliderTrack()}
                    />
                    <ArkColorPicker.ChannelSliderTrack
                      className={styles.sliderTrack()}
                    />
                    <ArkColorPicker.ChannelSliderThumb
                      aria-label="不透明度"
                      className={styles.thumb()}
                    />
                  </ArkColorPicker.ChannelSlider>
                )}
              </div>
            </div>
            {presets !== undefined && presets.length > 0 && (
              <ArkColorPicker.SwatchGroup className={styles.presets()}>
                {presets.map((preset) => (
                  <ArkColorPicker.SwatchTrigger
                    key={preset}
                    value={preset}
                    aria-label={preset}
                    className={styles.presetTrigger()}
                  >
                    <ArkColorPicker.Swatch
                      value={preset}
                      className={styles.swatch()}
                    >
                      <ArkColorPicker.SwatchIndicator
                        className={styles.presetIndicator()}
                      >
                        <Check aria-hidden="true" />
                      </ArkColorPicker.SwatchIndicator>
                    </ArkColorPicker.Swatch>
                  </ArkColorPicker.SwatchTrigger>
                ))}
              </ArkColorPicker.SwatchGroup>
            )}
          </ArkColorPicker.Content>
        </ArkColorPicker.Positioner>
      </Portal>
      <ArkColorPicker.HiddenInput />
    </ArkColorPicker.Root>
  );
};

export { parseColor };
