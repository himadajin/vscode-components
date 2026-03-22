import { createContext, forwardRef, useContext, useId, useState } from 'react';
import { Button } from '../Button';
import styles from './Table.module.css';

type TableContextValue = {
  selectedRowId: string | null;
  setSelectedRowId: (rowId: string | null) => void;
};

const TableContext = createContext<TableContextValue | null>(null);

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function getInteractiveRows(root: HTMLElement | null) {
  if (!root) {
    return [];
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>(
      '[data-vscode-table-row="true"][data-vscode-table-interactive="true"]',
    ),
  );
}

function focusAdjacentRow(
  currentRow: HTMLElement,
  direction: 'previous' | 'next',
  setSelectedRowId?: (rowId: string | null) => void,
) {
  const root = currentRow.closest<HTMLElement>(
    '[data-vscode-table-root="true"]',
  );
  const rows = getInteractiveRows(root);
  const currentIndex = rows.indexOf(currentRow);

  if (currentIndex < 0) {
    return;
  }

  const targetIndex =
    direction === 'next'
      ? Math.min(currentIndex + 1, rows.length - 1)
      : Math.max(currentIndex - 1, 0);
  const targetRow = rows[targetIndex];

  if (!targetRow) {
    return;
  }

  setSelectedRowId?.(targetRow.dataset.vscodeTableRowId ?? null);
  targetRow.focus();
}

export interface TableProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  columns?: string;
  selectedRowId?: string | null;
  defaultSelectedRowId?: string | null;
  onSelectedRowChange?: (rowId: string | null) => void;
  striped?: boolean;
  ariaLabel?: string;
  addButtonLabel?: string;
  onAddItem?: () => void;
  hideAddButton?: boolean;
}

export const Table = forwardRef<HTMLDivElement, TableProps>(function Table(
  {
    columns = 'minmax(0, 1fr)',
    selectedRowId: controlledSelectedRowId,
    defaultSelectedRowId = null,
    onSelectedRowChange,
    striped = false,
    className,
    style,
    ariaLabel,
    addButtonLabel = 'Add Item',
    onAddItem,
    hideAddButton = false,
    children,
    onFocus,
    ...props
  },
  forwardedRef,
) {
  const [uncontrolledSelectedRowId, setUncontrolledSelectedRowId] =
    useState(defaultSelectedRowId);
  const selectedRowId =
    controlledSelectedRowId === undefined
      ? uncontrolledSelectedRowId
      : controlledSelectedRowId;

  const setSelectedRowId = (rowId: string | null) => {
    if (controlledSelectedRowId === undefined) {
      setUncontrolledSelectedRowId(rowId);
    }
    onSelectedRowChange?.(rowId);
  };

  return (
    <TableContext.Provider value={{ selectedRowId, setSelectedRowId }}>
      <div
        {...props}
        ref={(node) => {
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            forwardedRef.current = node;
          }
        }}
        role="table"
        aria-label={ariaLabel}
        tabIndex={selectedRowId ? -1 : 0}
        data-vscode-table-root="true"
        className={joinClassNames(
          styles.root,
          striped && styles.striped,
          className,
        )}
        style={
          {
            ...style,
            '--vscode-table-columns': columns,
          } as React.CSSProperties
        }
        onFocus={(event) => {
          onFocus?.(event);
          if (event.target !== event.currentTarget) {
            return;
          }

          const rows = getInteractiveRows(event.currentTarget);
          const selectedRow =
            rows.find(
              (row) =>
                row.dataset.vscodeTableRowId === (selectedRowId ?? undefined),
            ) ?? rows[0];

          selectedRow?.focus();
        }}
      >
        {children}
        {onAddItem && !hideAddButton ? (
          <div className={styles.addButtonRow}>
            <Button className={styles.addButton} onClick={onAddItem}>
              {addButtonLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </TableContext.Provider>
  );
});

export type TableHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function TableHeader({
  className,
  children,
  ...props
}: TableHeaderProps) {
  return (
    <div
      {...props}
      role="rowgroup"
      className={joinClassNames(styles.headerGroup, className)}
    >
      <div role="row" className={styles.header}>
        {children}
      </div>
    </div>
  );
}

export interface TableHeaderCellProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  kind?: 'default' | 'key' | 'value' | 'actions';
}

export function TableHeaderCell({
  align = 'start',
  kind = 'default',
  className,
  children,
  ...props
}: TableHeaderCellProps) {
  return (
    <div
      {...props}
      role="columnheader"
      data-vscode-table-ignore-select={kind === 'actions' ? 'true' : undefined}
      className={joinClassNames(
        styles.headerCell,
        kind === 'key' && styles.keyCell,
        kind === 'value' && styles.valueCell,
        kind === 'actions' && styles.headerActionsCell,
        align === 'center' && styles.alignCenter,
        align === 'end' && styles.alignEnd,
        className,
      )}
    >
      {children}
    </div>
  );
}

export type TableBodyProps = React.HTMLAttributes<HTMLDivElement>;

export function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <div
      {...props}
      role="rowgroup"
      className={joinClassNames(styles.body, className)}
    >
      {children}
    </div>
  );
}

export interface TableRowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  rowId?: string;
  selected?: boolean;
  interactive?: boolean;
  hoverable?: boolean;
  invalid?: boolean;
  editing?: boolean;
  onSelect?: (rowId: string) => void;
  onAction?: (rowId: string) => void;
}

export const TableRow = forwardRef<HTMLDivElement, TableRowProps>(
  function TableRow(
    {
      rowId,
      selected,
      interactive = true,
      hoverable = true,
      invalid = false,
      editing = false,
      className,
      children,
      onClick,
      onDoubleClick,
      onFocus,
      onKeyDown,
      onSelect,
      onAction,
      ...props
    },
    forwardedRef,
  ) {
    const context = useContext(TableContext);
    const generatedId = useId();
    const resolvedRowId = rowId ?? generatedId;
    const isSelected = selected ?? context?.selectedRowId === resolvedRowId;

    return (
      <div
        {...props}
        ref={forwardedRef}
        role="row"
        tabIndex={interactive ? (isSelected ? 0 : -1) : undefined}
        data-vscode-table-row="true"
        data-vscode-table-row-id={resolvedRowId}
        data-vscode-table-interactive={interactive ? 'true' : 'false'}
        className={joinClassNames(
          styles.row,
          editing && styles.editingRow,
          interactive && styles.interactive,
          hoverable && styles.hoverable,
          isSelected && styles.selected,
          invalid && styles.invalid,
          className,
        )}
        onClick={(event) => {
          onClick?.(event);
          if (
            !interactive ||
            event.defaultPrevented ||
            (event.target as HTMLElement | null)?.closest(
              '[data-vscode-table-ignore-select="true"]',
            )
          ) {
            return;
          }

          context?.setSelectedRowId(resolvedRowId);
          onSelect?.(resolvedRowId);
        }}
        onDoubleClick={(event) => {
          onDoubleClick?.(event);
          if (
            event.defaultPrevented ||
            (event.target as HTMLElement | null)?.closest(
              '[data-vscode-table-ignore-select="true"]',
            )
          ) {
            return;
          }

          onAction?.(resolvedRowId);
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (!interactive) {
            return;
          }

          context?.setSelectedRowId(resolvedRowId);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || !interactive) {
            return;
          }

          if (event.key === 'ArrowDown') {
            focusAdjacentRow(
              event.currentTarget,
              'next',
              context?.setSelectedRowId,
            );
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          if (event.key === 'ArrowUp') {
            focusAdjacentRow(
              event.currentTarget,
              'previous',
              context?.setSelectedRowId,
            );
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          if (
            onAction &&
            (event.key === 'Enter' || event.key === ' ') &&
            !(event.target as HTMLElement | null)?.closest(
              '[data-vscode-table-ignore-select="true"]',
            )
          ) {
            onAction(resolvedRowId);
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {children}
      </div>
    );
  },
);

export interface TableCellProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
  kind?: 'default' | 'key' | 'value' | 'actions';
  tone?: 'default' | 'muted';
}

export function TableCell({
  align = 'start',
  kind = 'default',
  tone = 'default',
  className,
  children,
  ...props
}: TableCellProps) {
  return (
    <div
      {...props}
      role="cell"
      data-vscode-table-ignore-select={kind === 'actions' ? 'true' : undefined}
      className={joinClassNames(
        styles.cell,
        kind === 'key' && styles.keyCell,
        kind === 'value' && styles.valueCell,
        kind === 'actions' && styles.actionsCell,
        tone === 'muted' && styles.muted,
        align === 'center' && styles.alignCenter,
        align === 'end' && styles.alignEnd,
        className,
      )}
    >
      {children}
    </div>
  );
}

export const tableClassNames = {
  editingField: styles.editingField,
  editingFieldFill: styles.editingFieldFill,
  editingKeyField: styles.editingKeyField,
  okButton: styles.okButton,
};
