import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { mergeRefs, useWebComponentEvent } from '../../hooks/useWebComponent';
import styles from './MultiSelect.module.css';

type MultiSelectOption = {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
};

type MultiSelectElement = HTMLElement & {
  value?: string[];
  defaultValue?: string[];
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  label?: string;
  combobox?: boolean;
  creatable?: boolean;
  updateComplete?: Promise<unknown>;
};

export interface MultiSelectProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'defaultValue' | 'onChange'
> {
  value?: string[];
  defaultValue?: string[];
  enum?: string[];
  enumDescriptions?: string[];
  enumItemLabels?: string[];
  options?: MultiSelectOption[];
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  fill?: boolean;
  label?: string;
  combobox?: boolean;
  creatable?: boolean;
  onChange?: (value: string[]) => void;
}

export const MultiSelect = forwardRef<HTMLElement, MultiSelectProps>(
  function MultiSelect(
    {
      value,
      defaultValue,
      enum: enumValues,
      enumDescriptions,
      enumItemLabels,
      options,
      disabled,
      required,
      invalid,
      fill = false,
      label,
      combobox = false,
      creatable = false,
      className,
      onChange,
      ...props
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLElement | null>(null);
    const [internalValue, setInternalValue] = useState<string[]>(
      defaultValue ?? [],
    );

    const normalizedOptions = useMemo<MultiSelectOption[]>(() => {
      if (options) {
        return options;
      }

      return (enumValues ?? []).map((item, index) => ({
        value: item,
        label: enumItemLabels?.[index] ?? item,
        description: enumDescriptions?.[index],
        disabled: false,
      }));
    }, [enumDescriptions, enumItemLabels, enumValues, options]);

    const currentValue = value ?? internalValue;
    const currentValueKey = currentValue.join('\u0000');

    useEffect(() => {
      let disposed = false;

      const syncElement = async () => {
        const element = innerRef.current as MultiSelectElement | null;
        if (!element) {
          return;
        }

        await element.updateComplete;
        if (disposed || innerRef.current !== element) {
          return;
        }

        element.disabled = disabled;
        element.label = label ?? '';
        element.combobox = combobox;
        element.creatable = creatable;
        element.required = required;
        element.invalid = invalid;
        element.value = currentValue;
      };

      void syncElement();

      return () => {
        disposed = true;
      };
    }, [
      combobox,
      creatable,
      currentValue,
      currentValueKey,
      disabled,
      invalid,
      label,
      required,
    ]);

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    useWebComponentEvent(
      innerRef,
      'change',
      (element) => {
        const nextValue = (element as MultiSelectElement).value;
        return Array.isArray(nextValue) ? [...nextValue] : [];
      },
      (nextValue) => {
        if (value === undefined) {
          setInternalValue(nextValue);
        }
        onChange?.(nextValue);
      },
    );

    const classes = [styles.root, fill ? styles.fill : '', className ?? '']
      .filter(Boolean)
      .join(' ');

    return (
      <vscode-multi-select
        ref={mergeRefs(innerRef, forwardedRef)}
        className={classes}
        {...props}
      >
        {normalizedOptions.map((option) => (
          <vscode-option
            key={option.value}
            value={option.value}
            description={option.description}
            selected={currentValue.includes(option.value)}
            disabled={option.disabled}
          >
            {option.label ?? option.value}
          </vscode-option>
        ))}
      </vscode-multi-select>
    );
  },
);
