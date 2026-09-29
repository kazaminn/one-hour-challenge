'use client';

import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartFrame,
  ChartTooltip,
  seriesLegend,
  seriesTable,
  type ChartDatum,
  type ChartFrameProps,
  type ChartSeries,
} from './ChartFrame';
import {
  CHART_CHROME,
  seriesColor,
  seriesDash,
  useEnterDuration,
} from './chartTheme';

export type CartesianChartProps = Omit<
  ChartFrameProps,
  'children' | 'legend' | 'table'
> & {
  data: ChartDatum[];
  // The key of the category or time value on the x axis, and its name
  // in the table header.
  xKey: string;
  xLabel?: string;
  series: ChartSeries[];
  formatValue?: (value: number) => string;
};

export const axisProps = {
  stroke: CHART_CHROME.axis,
  tick: { fill: CHART_CHROME.text, fontSize: 12 },
  tickLine: false,
} as const;

// Change over time: 2px lines, a dash pattern per series on top of its
// color, markers with a surface ring where lines cross.
export const LineChart = ({
  data,
  xKey,
  xLabel = xKey,
  series,
  formatValue,
  ...frame
}: CartesianChartProps) => {
  const duration = useEnterDuration();
  return (
    <ChartFrame
      legend={seriesLegend(series, { dashed: true })}
      table={seriesTable(data, xKey, xLabel, series)}
      {...frame}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke={CHART_CHROME.grid} vertical={false} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis
            {...axisProps}
            axisLine={false}
            width={48}
            tickFormatter={formatValue}
          />
          <Tooltip
            cursor={{ stroke: CHART_CHROME.axis }}
            content={<ChartTooltip formatValue={formatValue} />}
          />
          {series.map((entry, index) => (
            <Line
              key={entry.key}
              type="monotone"
              dataKey={entry.key}
              name={entry.label}
              stroke={seriesColor(index)}
              strokeWidth={2}
              strokeDasharray={seriesDash(index)}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{
                r: 4,
                fill: seriesColor(index),
                stroke: CHART_CHROME.surface,
                strokeWidth: 2,
              }}
              activeDot={{ r: 6, stroke: CHART_CHROME.surface, strokeWidth: 2 }}
              isAnimationActive={duration > 1}
              animationDuration={duration}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
};
