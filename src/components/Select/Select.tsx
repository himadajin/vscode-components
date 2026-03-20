import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { mergeRefs, useWebComponentEvent } from '../../hooks/useWebComponent';
import styles from './Select.module.css';

export interface SelectProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'defaultValue' | 'onChange'
> {
  value?: string;
  defaultValue?: string;
  enum: string[];
  enumDescriptions?: string[];
  enumItemLabels?: string[];
  disabled?: boolean;
  onChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLElement, SelectProps>(function Select(
  {
    value,
    defaultValue,
    enum: values,
    enumDescriptions,
    enumItemLabels,
    disabled,
    onChange,
    className,
    ...props
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLElement | null>(null);
  const normalizedValue = value ?? defaultValue ?? values[0] ?? '';

  useEffect(() => {
    const element = innerRef.current as
      | (HTMLElement & { value?: string })
      | null;
    if (element) {
      element.value = normalizedValue;
    }
  }, [normalizedValue]);

  useWebComponentEvent(
    innerRef,
    'change',
    (element) => (element as HTMLElement & { value?: string }).value ?? '',
    (nextValue) => onChange?.(nextValue),
  );

  const options = useMemo(
    () =>
      values.map((item, index) => ({
        value: item,
        label: enumItemLabels?.[index] ?? item,
        description: enumDescriptions?.[index],
      })),
    [enumDescriptions, enumItemLabels, values],
  );

  const classes = [styles.select, className ?? ''].filter(Boolean).join(' ');

  return (
    <vscode-single-select
      ref={mergeRefs(innerRef, forwardedRef)}
      className={classes}
      value={normalizedValue}
      disabled={disabled}
      {...props}
    >
      {options.map((option) => (
        <vscode-option
          key={option.value}
          value={option.value}
          selected={option.value === normalizedValue}
          title={option.description}
        >
          {option.label}
        </vscode-option>
      ))}
    </vscode-single-select>
  );
});
