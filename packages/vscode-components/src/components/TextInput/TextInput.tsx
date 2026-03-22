import { forwardRef } from 'react';
import styles from './TextInput.module.css';

export interface TextInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
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

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
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
    const widthClass = type === 'string' ? styles.string : styles.number;
    const classes = [styles.root, widthClass, className ?? '']
      .filter(Boolean)
      .join(' ');

    return (
      <input
        ref={forwardedRef}
        className={classes}
        value={value === undefined ? undefined : String(value)}
        defaultValue={
          defaultValue === undefined ? undefined : String(defaultValue)
        }
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        type={type === 'string' ? 'text' : 'number'}
        pattern={pattern}
        maxLength={maxLength}
        minLength={minLength}
        onInput={(event) => onChange?.(event.currentTarget.value)}
        onChange={(event) => onChange?.(event.currentTarget.value)}
        {...props}
      />
    );
  },
);
