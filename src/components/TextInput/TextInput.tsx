import { forwardRef, useEffect, useRef } from 'react';
import { mergeRefs, useWebComponentEvent } from '../../hooks/useWebComponent';
import styles from './TextInput.module.css';

export interface TextInputProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'defaultValue' | 'onChange'
> {
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  type?: 'string' | 'number' | 'integer';
  pattern?: string;
  maxLength?: number;
  minLength?: number;
  onChange?: (value: string) => void;
}

export const TextInput = forwardRef<HTMLElement, TextInputProps>(
  function TextInput(
    {
      value,
      defaultValue,
      placeholder,
      disabled,
      readOnly,
      type = 'string',
      pattern,
      maxLength,
      minLength,
      onChange,
      className,
      ...props
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      const element = innerRef.current as
        | (HTMLElement & { value?: string })
        | null;
      if (element && value !== undefined) {
        element.value = String(value);
      }
    }, [value]);

    useEffect(() => {
      const element = innerRef.current as
        | (HTMLElement & { value?: string })
        | null;
      if (
        element &&
        value === undefined &&
        defaultValue !== undefined &&
        !element.value
      ) {
        element.value = String(defaultValue);
      }
    }, [defaultValue, value]);

    useWebComponentEvent(
      innerRef,
      'input',
      (element) => (element as HTMLElement & { value?: string }).value ?? '',
      (nextValue) => onChange?.(nextValue),
    );

    useWebComponentEvent(
      innerRef,
      'change',
      (element) => (element as HTMLElement & { value?: string }).value ?? '',
      (nextValue) => onChange?.(nextValue),
    );

    const widthClass = type === 'string' ? styles.string : styles.number;
    const classes = [styles.root, widthClass, className ?? '']
      .filter(Boolean)
      .join(' ');

    return (
      <vscode-textfield
        ref={mergeRefs(innerRef, forwardedRef)}
        className={classes}
        value={value === undefined ? undefined : String(value)}
        placeholder={placeholder}
        disabled={disabled}
        readonly={readOnly}
        type={type === 'string' ? 'text' : 'number'}
        pattern={pattern}
        maxlength={maxLength}
        minlength={minLength}
        {...props}
      />
    );
  },
);
