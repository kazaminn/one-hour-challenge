'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartFrame, ChartTooltip, type ChartFrameProps } from './ChartFrame';
import { CHART_CHROME, seriesColor, useEnterDuration } from './chartTheme';

export type DonutSlice = {
  name: string;
  value: number;
};

export type DonutChartProps = Omit<
  ChartFrameProps,
  'children' | 'legend' | 'table'
> & {
  data: DonutSlice[];
  nameLabel?: string;
  valueLabel?: string;
  formatValue?: (value: number) => string;
};

const share = (value: number, total: number): string =>
  total === 0 ? '—' : `${((value / total) * 100).toFixed(1)}%`;

// Parts of a whole, at most seven slices: the surface gap between slices
// does the separating, and the table carries the share of each.
export const DonutChart = ({
  data,
  nameLabel = '区分',
  valueLabel = '値',
  formatValue = (value) => value.toLocaleString('ja-JP'),
  height = 224,
  ...frame
}: DonutChartProps) => {
  const duration = useEnterDuration();
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  return (
    <ChartFrame
      height={height}
      legend={data.map((slice, index) => ({
        label: slice.name,
        color: seriesColor(index),
      }))}
      table={{
        head: [nameLabel, valueLabel, '割合'],
        rows: data.map((slice) => [
          slice.name,
          formatValue(slice.value),
          share(slice.value, total),
        ]),
      }}
      {...frame}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="95%"
            paddingAngle={2}
            stroke={CHART_CHROME.surface}
            strokeWidth={2}
            isAnimationActive={duration > 1}
            animationDuration={duration}
          >
            {data.map((slice, index) => (
              <Cell key={slice.name} fill={seriesColor(index)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
};
