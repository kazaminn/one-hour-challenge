'use client';

// A countdown or stopwatch. Ark keeps the clock; the wrapper lays out
// the digits, names the area for assistive technology and offers the
// start / pause / resume / reset controls.
import { Timer as ArkTimer } from '@ark-ui/react/timer';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { tv } from '../../tv';
import { buttonStyles } from '../Button';

const timerStyles = tv({
  slots: {
    root: 'inline-flex flex-col items-start gap-3',
    area: 'flex items-center gap-1',
    item: 'min-w-[2ch] text-center font-mono text-highlight-28 font-bold base-fg-strong tabular-nums',
    separator: 'text-highlight-28 font-bold base-fg-muted',
    control: 'flex flex-wrap items-center gap-2',
  },
});

const styles = timerStyles();

type TimerProps = Omit<ArkTimer.RootProps, 'children'> & {
  // Shows the days field; hours, minutes and seconds are always shown.
  showDays?: boolean;
  controls?: boolean;
};

const UNIT_LABELS = {
  days: '日',
  hours: '時間',
  minutes: '分',
  seconds: '秒',
} as const;

const defaultTranslations: ArkTimer.RootProps['translations'] = {
  areaLabel: (time) =>
    (Object.keys(UNIT_LABELS) as (keyof typeof UNIT_LABELS)[])
      .filter((unit) => unit !== 'days' || time.days > 0)
      .map((unit) => `${time[unit]}${UNIT_LABELS[unit]}`)
      .join(''),
};

const button = buttonStyles({ variant: 'outline', size: 'sm' });

export const Timer = ({
  showDays = false,
  controls = true,
  translations,
  className,
  ...props
}: TimerProps) => (
  <ArkTimer.Root
    translations={{ ...defaultTranslations, ...translations }}
    className={styles.root({ className })}
    {...props}
  >
    <ArkTimer.Area className={styles.area()}>
      {showDays && (
        <>
          <ArkTimer.Item type="days" className={styles.item()} />
          <ArkTimer.Separator className={styles.separator()}>
            :
          </ArkTimer.Separator>
        </>
      )}
      <ArkTimer.Item type="hours" className={styles.item()} />
      <ArkTimer.Separator className={styles.separator()}>:</ArkTimer.Separator>
      <ArkTimer.Item type="minutes" className={styles.item()} />
      <ArkTimer.Separator className={styles.separator()}>:</ArkTimer.Separator>
      <ArkTimer.Item type="seconds" className={styles.item()} />
    </ArkTimer.Area>
    {controls && (
      <ArkTimer.Control className={styles.control()}>
        <ArkTimer.ActionTrigger action="start" className={button}>
          <Play aria-hidden="true" className="size-4" />
          開始
        </ArkTimer.ActionTrigger>
        <ArkTimer.ActionTrigger action="pause" className={button}>
          <Pause aria-hidden="true" className="size-4" />
          一時停止
        </ArkTimer.ActionTrigger>
        <ArkTimer.ActionTrigger action="resume" className={button}>
          <Play aria-hidden="true" className="size-4" />
          再開
        </ArkTimer.ActionTrigger>
        <ArkTimer.ActionTrigger action="reset" className={button}>
          <RotateCcw aria-hidden="true" className="size-4" />
          リセット
        </ArkTimer.ActionTrigger>
      </ArkTimer.Control>
    )}
  </ArkTimer.Root>
);
