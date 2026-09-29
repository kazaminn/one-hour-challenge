'use client';

import { useId, useState, type ReactNode } from 'react';
import { tv } from '../../tv';
import { Button } from '../Button';
import { Table } from '../Table';
import { seriesColor, seriesDash } from './chartTheme';

// Shared shell for every chart: the plot is a single image for assistive
// technology, named by `label`; the same numbers are one click away as a
// Table so the figure is never color- or sight-only. The legend is HTML,
// outside the image, in text colors with a swatch that carries the hue and
// line pattern of its series.
const chartFrameStyles = tv({
  slots: {
    root: 'flex flex-col gap-3',
    plot: 'w-full text-dense-14',
    caption: 'text-dense-14 base-fg-muted',
    legend: 'flex flex-wrap gap-x-4 gap-y-1 text-dense-14 base-fg',
    legendItem: 'inline-flex items-center gap-2',
    swatch: 'inline-block h-3 w-6 shrink-0',
    tooltip:
      'rounded-surface border base-border-muted base-bg px-3 py-2 text-dense-14 shadow-floating',
    tooltipLabel: 'mb-1 font-medium base-fg-strong',
    tooltipRow: 'flex items-center gap-2 base-fg',
    tooltipValue: 'ms-auto base-fg-strong tabular-nums',
  },
});

const styles = chartFrameStyles();

export type ChartSeries = {
  key: string;
  label: string;
};

export type ChartDatum = Record<string, string | number | undefined>;

export type ChartTable = {
  head: string[];
  rows: (string | number)[][];
};

export type ChartFrameProps = {
  label: string;
  caption?: ReactNode;
  height?: number;
  legend?: { label: string; color: string; dash?: string }[];
  // The same data as a table; `toggle` hides it behind a button.
  table?: ChartTable;
  showTable?: 'toggle' | 'always' | 'never';
  className?: string;
  children: ReactNode;
};

export const LegendSwatch = ({
  color,
  dash,
}: {
  color: string;
  dash?: string;
}) => (
  <svg
    aria-hidden="true"
    className={styles.swatch()}
    viewBox="0 0 24 12"
    preserveAspectRatio="none"
  >
    {dash === undefined ? (
      <rect x="0" y="0" width="24" height="12" rx="2" fill={color} />
    ) : (
      <line
        x1="0"
        y1="6"
        x2="24"
        y2="6"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={dash}
      />
    )}
  </svg>
);

export const seriesLegend = (
  series: ChartSeries[],
  { dashed = false } = {},
): NonNullable<ChartFrameProps['legend']> =>
  series.map((entry, index) => ({
    label: entry.label,
    color: seriesColor(index),
    dash: dashed ? seriesDash(index) : undefined,
  }));

// The rows a cartesian chart shows in its table: one per x value.
export const seriesTable = (
  data: ChartDatum[],
  xKey: string,
  xLabel: string,
  series: ChartSeries[],
): ChartTable => ({
  head: [xLabel, ...series.map((entry) => entry.label)],
  rows: data.map((datum) => [
    datum[xKey] ?? '',
    ...series.map((entry) => datum[entry.key] ?? ''),
  ]),
});

export const ChartFrame = ({
  label,
  caption,
  height = 256,
  legend,
  table,
  showTable = 'toggle',
  className,
  children,
}: ChartFrameProps) => {
  const [tableOpen, setTableOpen] = useState(false);
  const tableId = useId();
  const tableVisible =
    table !== undefined &&
    showTable !== 'never' &&
    (showTable === 'always' || tableOpen);

  return (
    <figure className={styles.root({ className })}>
      <div
        role="img"
        aria-label={label}
        className={styles.plot()}
        style={{ height }}
      >
        {children}
      </div>
      {legend !== undefined && legend.length >= 2 && (
        <ul className={styles.legend()}>
          {legend.map((entry) => (
            <li key={entry.label} className={styles.legendItem()}>
              <LegendSwatch color={entry.color} dash={entry.dash} />
              {entry.label}
            </li>
          ))}
        </ul>
      )}
      {table !== undefined && showTable === 'toggle' && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={tableOpen}
            aria-controls={tableId}
            onClick={() => setTableOpen((open) => !open)}
          >
            {tableOpen ? '表を閉じる' : '表で見る'}
          </Button>
        </div>
      )}
      {table !== undefined && showTable !== 'never' && (
        <div id={tableId} hidden={!tableVisible}>
          <Table.ScrollArea>
            <Table.Root size="sm">
              <Table.Caption>{label}</Table.Caption>
              <Table.Header>
                <Table.Row>
                  {table.head.map((cell, index) => (
                    <Table.ColumnHeader
                      key={cell}
                      align={index === 0 ? 'start' : 'end'}
                    >
                      {cell}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {table.rows.map((row, rowIndex) => (
                  <Table.Row key={rowIndex}>
                    {row.map((cell, index) =>
                      index === 0 ? (
                        <th
                          key={index}
                          scope="row"
                          className="px-2 py-1.5 text-start font-medium base-fg-strong"
                        >
                          {cell}
                        </th>
                      ) : (
                        <Table.Cell
                          key={index}
                          align="end"
                          className="tabular-nums"
                        >
                          {cell}
                        </Table.Cell>
                      ),
                    )}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        </div>
      )}
      {/* Last child: a figure may only take its figcaption first or last,
          and the caption reads as a source note under the data. */}
      {caption !== undefined && (
        <figcaption className={styles.caption()}>{caption}</figcaption>
      )}
    </figure>
  );
};

type TooltipEntry = {
  name?: string | number;
  value?: string | number | readonly (string | number)[];
  color?: string;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: readonly TooltipEntry[];
  formatValue?: (value: number) => string;
};

// The hover card, in text colors with a swatch per series.
export const ChartTooltip = ({
  active,
  label,
  payload,
  formatValue = (value) => value.toLocaleString('ja-JP'),
}: ChartTooltipProps) => {
  if (active !== true || payload === undefined || payload.length === 0) {
    return undefined;
  }
  return (
    <div className={styles.tooltip()}>
      {label !== undefined && (
        <div className={styles.tooltipLabel()}>{label}</div>
      )}
      {payload.map((entry, index) => (
        <div key={index} className={styles.tooltipRow()}>
          <LegendSwatch color={entry.color ?? seriesColor(index)} />
          <span>{entry.name}</span>
          <span className={styles.tooltipValue()}>
            {typeof entry.value === 'number'
              ? formatValue(entry.value)
              : String(entry.value ?? '')}
          </span>
        </div>
      ))}
    </div>
  );
};
