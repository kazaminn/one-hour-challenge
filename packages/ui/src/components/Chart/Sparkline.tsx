'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { tv } from '../../tv';
import { CHART_CHROME, seriesColor, useEnterDuration } from './chartTheme';

const sparklineStyles = tv({
  base: 'inline-block h-8 w-24 align-middle',
});

export type SparklineProps = {
  data: number[];
  label: string;
  color?: string;
  className?: string;
};

// A trend beside a number: one 2px line, no axes, no tooltip. It is an
// image named by its label; the number it accompanies carries the value.
export const Sparkline = ({
  data,
  label,
  color = seriesColor(0),
  className,
}: SparklineProps) => {
  const duration = useEnterDuration();
  const points = data.map((value, index) => ({ index, value }));
  const last = points.length - 1;
  return (
    <span
      role="img"
      aria-label={label}
      className={sparklineStyles({ className })}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={points}
          margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            dot={(props: { index?: number; cx?: number; cy?: number }) =>
              props.index === last ? (
                <circle
                  key="end"
                  cx={props.cx}
                  cy={props.cy}
                  r={4}
                  fill={color}
                  stroke={CHART_CHROME.surface}
                  strokeWidth={2}
                />
              ) : (
                <g key={props.index} />
              )
            }
            isAnimationActive={duration > 1}
            animationDuration={duration}
          />
        </LineChart>
      </ResponsiveContainer>
    </span>
  );
};
