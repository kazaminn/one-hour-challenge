'use client';

import {
  Bar,
  CartesianGrid,
  BarChart as RechartsBarChart,
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
} from './ChartFrame';
import { CHART_CHROME, seriesColor, useEnterDuration } from './chartTheme';
import { axisProps, type CartesianChartProps } from './LineChart';

export type BarChartProps = CartesianChartProps & {
  stacked?: boolean;
};

// Magnitude by category: bars capped at 24px, rounded at the data end and
// square at the baseline, a surface gap between stacked segments.
export const BarChart = ({
  data,
  xKey,
  xLabel = xKey,
  series,
  formatValue,
  stacked = false,
  ...frame
}: BarChartProps) => {
  const duration = useEnterDuration();
  return (
    <ChartFrame
      legend={seriesLegend(series)}
      table={seriesTable(data, xKey, xLabel, series)}
      {...frame}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
          barCategoryGap="30%"
          barGap={2}
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
            cursor={{ fill: CHART_CHROME.grid, fillOpacity: 0.5 }}
            content={<ChartTooltip formatValue={formatValue} />}
          />
          {series.map((entry, index) => (
            <Bar
              key={entry.key}
              dataKey={entry.key}
              name={entry.label}
              fill={seriesColor(index)}
              stackId={stacked ? 'stack' : undefined}
              maxBarSize={24}
              radius={stacked && index < series.length - 1 ? 0 : [4, 4, 0, 0]}
              stroke={stacked ? CHART_CHROME.surface : undefined}
              strokeWidth={stacked ? 1 : 0}
              isAnimationActive={duration > 1}
              animationDuration={duration}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
};
