'use client';

// A text field with a calendar popover. Ark owns the calendar model, the
// keyboard grid, parsing and formatting in the LocaleProvider's locale;
// the wrapper renders the whole control and gives every part a Japanese
// name.
import type { ReactNode } from 'react';
import { DatePicker as ArkDatePicker } from '@ark-ui/react/date-picker';
import { Portal } from '@ark-ui/react/portal';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { tv } from '../../tv';
import { focusRing, menuListStyles } from '../../variants';
import { inputStyles } from '../Input';

const datePickerStyles = tv({
  slots: {
    root: 'flex flex-col gap-1.5',
    label: 'text-dense-14 font-medium base-fg-strong',
    control: 'flex items-center gap-2',
    input: [
      inputStyles(),
      'min-w-0 flex-1 tabular-nums',
      'ark-invalid:error-border-solid',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
    ],
    iconButton: [
      'inline-flex size-10 shrink-0 items-center justify-center rounded-control border base-border-muted base-fg-muted transition-colors [&>svg]:size-4',
      'hover:base-bg-subtle hover:base-fg-strong',
      'ark-disabled:pointer-events-none ark-disabled:opacity-50',
      focusRing(),
    ],
    content: 'flex max-h-none flex-col gap-3 p-4',
    view: 'flex flex-col gap-3',
    viewControl: 'flex items-center justify-between gap-2',
    viewTrigger: [
      'inline-flex h-8 flex-1 items-center justify-center rounded-control px-2 text-oneline-14 font-semibold base-fg-strong transition-colors',
      'hover:base-bg-subtle',
      focusRing(),
    ],
    navTrigger: [
      'inline-flex size-8 items-center justify-center rounded-control base-fg-muted transition-colors [&>svg]:size-4',
      'hover:base-bg-subtle hover:base-fg-strong',
      'ark-disabled:pointer-events-none ark-disabled:opacity-40',
      focusRing(),
    ],
    table: 'w-full border-separate border-spacing-0',
    tableHeader: 'h-8 text-center text-dense-14 font-medium base-fg-muted',
    tableCell: 'p-0 text-center',
    cellTrigger: [
      'inline-flex h-9 w-full items-center justify-center rounded-control text-dense-14 base-fg transition-colors select-none',
      'hover:base-bg-subtle',
      'ark-today:font-semibold ark-today:primary-fg',
      'ark-selected:primary-bg-solid ark-selected:primary-fg-contrast ark-selected:hover:primary-bg-solid',
      'ark-in-range:rounded-none ark-in-range:primary-bg-muted ark-in-range:primary-fg',
      'ark-range-start:rounded-s-control ark-range-start:primary-bg-solid ark-range-start:primary-fg-contrast',
      'ark-range-end:rounded-e-control ark-range-end:primary-bg-solid ark-range-end:primary-fg-contrast',
      'ark-outside-range:base-fg-subtle',
      'ark-unavailable:base-fg-subtle ark-unavailable:line-through',
      'ark-disabled:pointer-events-none ark-disabled:base-fg-subtle',
      'ark-focus:relative ark-focus:z-10',
      focusRing(),
    ],
  },
});

const styles = datePickerStyles();
const list = menuListStyles();

const VIEW_NAMES = { day: '月', month: '年', year: '10年' } as const;

// Ark's labels are English; these are read by assistive technology.
const defaultTranslations: ArkDatePicker.RootProps['translations'] = {
  trigger: (open) => (open ? 'カレンダーを閉じる' : 'カレンダーを開く'),
  clearTrigger: '日付を消去',
  content: 'カレンダー',
  prevTrigger: (view) => `前の${VIEW_NAMES[view]}`,
  nextTrigger: (view) => `次の${VIEW_NAMES[view]}`,
  viewTrigger: (view) =>
    view === 'day'
      ? '月の一覧へ'
      : view === 'month'
        ? '年の一覧へ'
        : '日の一覧へ',
  dayCell: (state) =>
    `${state.valueText}${state.today ? '（今日）' : ''}${state.selected ? '、選択中' : ''}`,
  placeholder: () => ({ year: 'yyyy', month: 'mm', day: 'dd' }),
};

type DatePickerProps = Omit<ArkDatePicker.RootProps, 'children'> & {
  label?: ReactNode;
  placeholder?: string;
  clearable?: boolean;
};

const ViewControl = () => (
  <ArkDatePicker.ViewControl className={styles.viewControl()}>
    <ArkDatePicker.PrevTrigger className={styles.navTrigger()}>
      <ChevronLeft aria-hidden="true" />
    </ArkDatePicker.PrevTrigger>
    <ArkDatePicker.ViewTrigger className={styles.viewTrigger()}>
      <ArkDatePicker.RangeText />
    </ArkDatePicker.ViewTrigger>
    <ArkDatePicker.NextTrigger className={styles.navTrigger()}>
      <ChevronRight aria-hidden="true" />
    </ArkDatePicker.NextTrigger>
  </ArkDatePicker.ViewControl>
);

const DayView = () => (
  <ArkDatePicker.View view="day" className={styles.view()}>
    <ArkDatePicker.Context>
      {(picker) => (
        <>
          <ViewControl />
          <ArkDatePicker.Table className={styles.table()}>
            <ArkDatePicker.TableHead>
              <ArkDatePicker.TableRow>
                {picker.weekDays.map((weekDay) => (
                  <ArkDatePicker.TableHeader
                    key={weekDay.long}
                    className={styles.tableHeader()}
                    aria-label={weekDay.long}
                  >
                    {weekDay.narrow}
                  </ArkDatePicker.TableHeader>
                ))}
              </ArkDatePicker.TableRow>
            </ArkDatePicker.TableHead>
            <ArkDatePicker.TableBody>
              {picker.weeks.map((week, weekIndex) => (
                <ArkDatePicker.TableRow key={weekIndex}>
                  {week.map((day) => (
                    <ArkDatePicker.TableCell
                      key={day.toString()}
                      value={day}
                      className={styles.tableCell()}
                    >
                      <ArkDatePicker.TableCellTrigger
                        className={styles.cellTrigger()}
                      >
                        {day.day}
                      </ArkDatePicker.TableCellTrigger>
                    </ArkDatePicker.TableCell>
                  ))}
                </ArkDatePicker.TableRow>
              ))}
            </ArkDatePicker.TableBody>
          </ArkDatePicker.Table>
        </>
      )}
    </ArkDatePicker.Context>
  </ArkDatePicker.View>
);

const MonthView = () => (
  <ArkDatePicker.View view="month" className={styles.view()}>
    <ArkDatePicker.Context>
      {(picker) => (
        <>
          <ViewControl />
          <ArkDatePicker.Table className={styles.table()}>
            <ArkDatePicker.TableBody>
              {picker
                .getMonthsGrid({ columns: 4, format: 'short' })
                .map((months, rowIndex) => (
                  <ArkDatePicker.TableRow key={rowIndex}>
                    {months.map((month) => (
                      <ArkDatePicker.TableCell
                        key={month.value}
                        value={month.value}
                        className={styles.tableCell()}
                      >
                        <ArkDatePicker.TableCellTrigger
                          className={styles.cellTrigger()}
                        >
                          {month.label}
                        </ArkDatePicker.TableCellTrigger>
                      </ArkDatePicker.TableCell>
                    ))}
                  </ArkDatePicker.TableRow>
                ))}
            </ArkDatePicker.TableBody>
          </ArkDatePicker.Table>
        </>
      )}
    </ArkDatePicker.Context>
  </ArkDatePicker.View>
);

const YearView = () => (
  <ArkDatePicker.View view="year" className={styles.view()}>
    <ArkDatePicker.Context>
      {(picker) => (
        <>
          <ViewControl />
          <ArkDatePicker.Table className={styles.table()}>
            <ArkDatePicker.TableBody>
              {picker.getYearsGrid({ columns: 4 }).map((years, rowIndex) => (
                <ArkDatePicker.TableRow key={rowIndex}>
                  {years.map((year) => (
                    <ArkDatePicker.TableCell
                      key={year.value}
                      value={year.value}
                      className={styles.tableCell()}
                    >
                      <ArkDatePicker.TableCellTrigger
                        className={styles.cellTrigger()}
                      >
                        {year.label}
                      </ArkDatePicker.TableCellTrigger>
                    </ArkDatePicker.TableCell>
                  ))}
                </ArkDatePicker.TableRow>
              ))}
            </ArkDatePicker.TableBody>
          </ArkDatePicker.Table>
        </>
      )}
    </ArkDatePicker.Context>
  </ArkDatePicker.View>
);

export const DatePicker = ({
  label,
  placeholder = 'yyyy/mm/dd',
  clearable = false,
  selectionMode,
  translations,
  className,
  ...props
}: DatePickerProps) => {
  const isRange = selectionMode === 'range';
  return (
    <ArkDatePicker.Root
      selectionMode={selectionMode}
      // Japanese calendars start the week on Sunday.
      startOfWeek={0}
      translations={{ ...defaultTranslations, ...translations }}
      className={styles.root({ className })}
      {...props}
    >
      {label !== undefined && (
        <ArkDatePicker.Label className={styles.label()}>
          {label}
        </ArkDatePicker.Label>
      )}
      <ArkDatePicker.Control className={styles.control()}>
        <ArkDatePicker.Input
          index={0}
          placeholder={placeholder}
          className={styles.input()}
        />
        {isRange && (
          <ArkDatePicker.Input
            index={1}
            placeholder={placeholder}
            className={styles.input()}
          />
        )}
        <ArkDatePicker.Trigger className={styles.iconButton()}>
          <CalendarDays aria-hidden="true" />
        </ArkDatePicker.Trigger>
        {clearable && (
          <ArkDatePicker.ClearTrigger className={styles.iconButton()}>
            <X aria-hidden="true" />
          </ArkDatePicker.ClearTrigger>
        )}
      </ArkDatePicker.Control>
      <Portal>
        <ArkDatePicker.Positioner className={list.positioner()}>
          <ArkDatePicker.Content
            className={list.content({ className: styles.content() })}
          >
            <DayView />
            <MonthView />
            <YearView />
          </ArkDatePicker.Content>
        </ArkDatePicker.Positioner>
      </Portal>
    </ArkDatePicker.Root>
  );
};
