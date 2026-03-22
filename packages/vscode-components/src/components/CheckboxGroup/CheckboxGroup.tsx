import { useEffect, useId, useMemo, useState } from 'react';
import styles from './CheckboxGroup.module.css';

export interface CheckboxGroupItem {
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface CheckboxGroupChangeDetail {
  key: string;
  checked: boolean;
}

export interface CheckboxGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  items: CheckboxGroupItem[];
  value?: Record<string, boolean>;
  defaultValue?: Record<string, boolean>;
  disabled?: boolean;
  invalid?: boolean;
  emptyMessage?: React.ReactNode;
  validationMessage?: React.ReactNode;
  onChange?: (
    value: Record<string, boolean>,
    detail: CheckboxGroupChangeDetail,
  ) => void;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function buildValueMap(
  items: CheckboxGroupItem[],
  source?: Record<string, boolean>,
) {
  const nextValue: Record<string, boolean> = {};

  for (const item of items) {
    nextValue[item.key] = Boolean(source?.[item.key]);
  }

  return nextValue;
}

export function CheckboxGroup({
  items,
  value,
  defaultValue,
  disabled = false,
  invalid = false,
  emptyMessage = 'No items available.',
  validationMessage,
  className,
  onChange,
  ...props
}: CheckboxGroupProps) {
  const groupId = useId();
  const validationId = useId();
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    buildValueMap(items, defaultValue),
  );

  useEffect(() => {
    if (value !== undefined) {
      return;
    }

    setUncontrolledValue((current) => {
      const next = buildValueMap(items, { ...defaultValue, ...current });
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);

      if (
        currentKeys.length === nextKeys.length &&
        currentKeys.every((key) => current[key] === next[key])
      ) {
        return current;
      }

      return next;
    });
  }, [defaultValue, items, value]);

  const resolvedValue = useMemo(
    () =>
      value !== undefined ? buildValueMap(items, value) : uncontrolledValue,
    [items, uncontrolledValue, value],
  );

  const handleToggle = (item: CheckboxGroupItem) => {
    if (disabled || item.disabled) {
      return;
    }

    const nextChecked = !resolvedValue[item.key];
    const nextValue = {
      ...resolvedValue,
      [item.key]: nextChecked,
    };

    if (value === undefined) {
      setUncontrolledValue(nextValue);
    }

    onChange?.(nextValue, { key: item.key, checked: nextChecked });
  };

  const handleCheckboxClick = (
    event: React.MouseEvent<HTMLDivElement>,
    item: CheckboxGroupItem,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    handleToggle(item);
  };

  const handleCheckboxKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    item: CheckboxGroupItem,
  ) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      handleToggle(item);
    }
  };

  const handleLabelMouseDown = (
    event: React.MouseEvent<HTMLSpanElement>,
    item: CheckboxGroupItem,
  ) => {
    const target = event.target as HTMLElement;
    if (target.closest('a')) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handleToggle(item);
  };

  return (
    <div
      {...props}
      className={joinClasses(styles.root, className)}
      role="group"
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && validationMessage ? validationId : undefined}
    >
      <div
        className={joinClasses(
          styles.editor,
          invalid && styles.invalid,
          items.length === 0 && styles.emptyEditor,
        )}
        role="list"
      >
        {items.length === 0 ? (
          <div className={styles.empty}>{emptyMessage}</div>
        ) : (
          items.map((item) => {
            const checked = resolvedValue[item.key];
            const itemDisabled = disabled || Boolean(item.disabled);
            const labelId = `${groupId}-${item.key}-label`;

            return (
              <div
                key={item.key}
                className={joinClasses(
                  styles.row,
                  checked && styles.checked,
                  itemDisabled && styles.disabled,
                )}
                role="listitem"
              >
                <div
                  aria-checked={checked}
                  aria-disabled={itemDisabled || undefined}
                  aria-labelledby={labelId}
                  className={styles.checkbox}
                  role="checkbox"
                  tabIndex={itemDisabled ? -1 : 0}
                  onClick={(event) => handleCheckboxClick(event, item)}
                  onKeyDown={(event) => handleCheckboxKeyDown(event, item)}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <span className={joinClasses('codicon', 'codicon-check')} />
                </div>
                <span
                  id={labelId}
                  className={styles.label}
                  onMouseDown={(event) => handleLabelMouseDown(event, item)}
                >
                  {item.label}
                </span>
              </div>
            );
          })
        )}
      </div>
      {validationMessage ? (
        <div
          id={validationId}
          className={joinClasses(
            styles.validationMessage,
            invalid && styles.validationMessageVisible,
          )}
        >
          {validationMessage}
        </div>
      ) : null}
    </div>
  );
}
