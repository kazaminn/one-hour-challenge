'use client';

// Root's variants reach the parts through context.
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type ComponentPropsWithRef,
} from 'react';
import { tv, type VariantProps } from '../../tv';

const tableStyles = tv({
  slots: {
    scrollArea: 'w-full overflow-x-auto',
    root: 'w-full border-collapse text-dense-14 base-fg',
    caption: 'py-2 text-start text-dense-14 base-fg-muted',
    header: '',
    body: '',
    footer: 'font-medium base-fg-strong',
    row: 'transition-colors',
    columnHeader: 'text-start font-semibold base-fg-strong',
    cell: 'align-top',
    columnGroup: '',
  },
  variants: {
    size: {
      sm: { columnHeader: 'px-2 py-1.5', cell: 'px-2 py-1.5' },
      md: { columnHeader: 'px-3 py-2', cell: 'px-3 py-2' },
      lg: { columnHeader: 'px-4 py-3', cell: 'px-4 py-3' },
    },
    variant: {
      // rules between rows only
      line: {
        columnHeader: 'border-b base-border-muted',
        cell: 'border-b base-border-muted',
      },
      // a framed table with a tinted header
      outline: {
        root: 'border base-border-muted',
        header: 'base-bg-subtle',
        columnHeader: 'border-b base-border-muted',
        cell: 'border-b base-border-muted',
      },
    },
    striped: {
      true: { row: 'even:base-bg-subtle' },
    },
    interactive: {
      true: { row: 'hover:base-bg-muted' },
    },
    stickyHeader: {
      true: { header: 'sticky top-0 z-docked base-bg' },
    },
    showColumnBorder: {
      true: {
        columnHeader: 'base-border-muted not-last:border-e',
        cell: 'base-border-muted not-last:border-e',
      },
    },
  },
  defaultVariants: { size: 'md', variant: 'line' },
});

type TableVariants = VariantProps<typeof tableStyles>;
type TableSlots = ReturnType<typeof tableStyles>;

const TableContext = createContext<TableSlots>(tableStyles());

const useTableStyles = (): TableSlots => useContext(TableContext);

// A ColumnHeader inside Body or Footer heads its row, not a column.
type TableSection = 'header' | 'body' | 'footer';
const TableSectionContext = createContext<TableSection>('header');

// Caption registers its id here so the ScrollArea region is named by it.
// The value is the stable useState setter: a fresh object per render would
// rerun Caption's effect forever.
const ScrollAreaLabelContext = createContext<
  ((id: string | undefined) => void) | undefined
>(undefined);

// Replaces the legacy `align` attribute with logical values.
type AlignProps = {
  align?: 'start' | 'center' | 'end';
};

type WithAlign<T extends 'th' | 'td'> = Omit<
  ComponentPropsWithRef<T>,
  'align'
> &
  AlignProps;

const alignClass: Record<NonNullable<AlignProps['align']>, string> = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
};

// Focusable so keyboard users can scroll it (axe:
// scrollable-region-focusable); a Caption inside names the region.
export const TableScrollArea = ({
  tabIndex,
  className,
  ...props
}: ComponentPropsWithRef<'div'>) => {
  const styles = useTableStyles();
  const [labelId, setLabelId] = useState<string | undefined>(undefined);
  return (
    <ScrollAreaLabelContext.Provider value={setLabelId}>
      <div
        role={labelId !== undefined ? 'region' : undefined}
        aria-labelledby={labelId}
        tabIndex={tabIndex ?? 0}
        className={styles.scrollArea({ className })}
        {...props}
      />
    </ScrollAreaLabelContext.Provider>
  );
};

export const TableRoot = ({
  size,
  variant,
  striped,
  interactive,
  stickyHeader,
  showColumnBorder,
  className,
  ...props
}: ComponentPropsWithRef<'table'> & TableVariants) => {
  const styles = tableStyles({
    size,
    variant,
    striped,
    interactive,
    stickyHeader,
    showColumnBorder,
  });
  return (
    <TableContext.Provider value={styles}>
      <table className={styles.root({ className })} {...props} />
    </TableContext.Provider>
  );
};

export const TableCaption = ({
  id,
  className,
  ...props
}: ComponentPropsWithRef<'caption'>) => {
  const styles = useTableStyles();
  const generatedId = useId();
  const captionId = id ?? generatedId;
  const setScrollAreaLabelId = useContext(ScrollAreaLabelContext);
  useEffect(() => {
    setScrollAreaLabelId?.(captionId);
    return () => setScrollAreaLabelId?.(undefined);
  }, [captionId, setScrollAreaLabelId]);
  return (
    <caption
      id={captionId}
      className={styles.caption({ className })}
      {...props}
    />
  );
};

export const TableHeader = ({
  className,
  ...props
}: ComponentPropsWithRef<'thead'>) => {
  const styles = useTableStyles();
  return (
    <TableSectionContext.Provider value="header">
      <thead className={styles.header({ className })} {...props} />
    </TableSectionContext.Provider>
  );
};

export const TableBody = ({
  className,
  ...props
}: ComponentPropsWithRef<'tbody'>) => {
  const styles = useTableStyles();
  return (
    <TableSectionContext.Provider value="body">
      <tbody className={styles.body({ className })} {...props} />
    </TableSectionContext.Provider>
  );
};

export const TableFooter = ({
  className,
  ...props
}: ComponentPropsWithRef<'tfoot'>) => {
  const styles = useTableStyles();
  return (
    <TableSectionContext.Provider value="footer">
      <tfoot className={styles.footer({ className })} {...props} />
    </TableSectionContext.Provider>
  );
};

type TableRowProps = ComponentPropsWithRef<'tr'> & {
  // sets aria-selected and data-selected
  selected?: boolean;
};

export const TableRow = ({ selected, className, ...props }: TableRowProps) => {
  const styles = useTableStyles();
  return (
    <tr
      aria-selected={selected}
      data-selected={selected === true ? '' : undefined}
      className={styles.row({
        className: [selected === true && 'base-bg-selected', className],
      })}
      {...props}
    />
  );
};

export const TableColumnHeader = ({
  align,
  className,
  ...props
}: WithAlign<'th'>) => {
  const styles = useTableStyles();
  const section = useContext(TableSectionContext);
  return (
    <th
      scope={section === 'header' ? 'col' : 'row'}
      className={styles.columnHeader({
        className: [align && alignClass[align], className],
      })}
      {...props}
    />
  );
};

export const TableCell = ({ align, className, ...props }: WithAlign<'td'>) => {
  const styles = useTableStyles();
  return (
    <td
      className={styles.cell({
        className: [align && alignClass[align], className],
      })}
      {...props}
    />
  );
};

export const TableColumnGroup = ({
  className,
  ...props
}: ComponentPropsWithRef<'colgroup'>) => {
  const styles = useTableStyles();
  return <colgroup className={styles.columnGroup({ className })} {...props} />;
};
