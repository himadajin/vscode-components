import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'defaultValue' | 'onChange' | 'value'
> {
  value?: string;
  defaultValue?: string;
  invalid?: boolean;
  monospace?: boolean;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  onChange?: (value: string) => void;
}

const formFeedCharacter = String.fromCharCode(12);

function getMirrorValue(value: string, rows: number | undefined) {
  const normalizedValue = value.replaceAll(formFeedCharacter, '');
  const lineCount =
    normalizedValue.length === 0 ? 1 : normalizedValue.split('\n').length;
  const minRows = Math.max(rows ?? 1, 1);
  const suffix = normalizedValue.endsWith('\n') ? ' ' : '';

  if (normalizedValue.length === 0 && minRows <= 1) {
    return '\u00a0';
  }

  if (lineCount >= minRows) {
    return normalizedValue.length === 0 ? '\u00a0' : normalizedValue + suffix;
  }

  const paddingLines = '\n'.repeat(minRows - lineCount);
  const baseValue =
    normalizedValue.length === 0 ? '' : normalizedValue + suffix;
  return `${baseValue}${paddingLines} `;
}

function syncTextareaHeight(
  textarea: HTMLTextAreaElement | null,
  mirror: HTMLDivElement | null,
  mirrorValue: string,
) {
  if (!textarea || !mirror) {
    return;
  }

  mirror.textContent = mirrorValue;
  const nextHeight = `${mirror.getBoundingClientRect().height}px`;
  if (textarea.style.height !== nextHeight) {
    textarea.style.height = nextHeight;
  }
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      value,
      defaultValue,
      placeholder,
      disabled,
      readOnly,
      required,
      invalid,
      monospace,
      resize = 'none',
      rows,
      cols,
      minLength,
      maxLength,
      autoComplete,
      autoFocus,
      spellCheck = false,
      className,
      onChange,
      onInput,
      onBlur,
      onFocus,
      ...props
    },
    forwardedRef,
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const mirrorRef = useRef<HTMLDivElement | null>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(
      () => defaultValue ?? '',
    );

    const currentValue = value ?? uncontrolledValue;
    const mirrorValue = useMemo(
      () => getMirrorValue(currentValue, rows),
      [currentValue, rows],
    );

    useImperativeHandle(forwardedRef, () => textareaRef.current!, []);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.setAttribute('autocorrect', 'off');
      textarea.setAttribute('autocapitalize', 'off');
    }, []);

    useLayoutEffect(() => {
      syncTextareaHeight(textareaRef.current, mirrorRef.current, mirrorValue);
    });

    useEffect(() => {
      if (typeof window === 'undefined') {
        return;
      }

      const handleResize = () => {
        syncTextareaHeight(textareaRef.current, mirrorRef.current, mirrorValue);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [mirrorValue]);

    const rootClassName = [
      styles.root,
      monospace ? styles.monospace : '',
      invalid ? styles.invalid : '',
      disabled ? styles.disabled : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const textareaClassName = [
      styles.input,
      currentValue.length === 0 ? styles.empty : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={rootClassName}>
        <div aria-hidden className={styles.mirror} ref={mirrorRef} />
        <textarea
          {...props}
          ref={textareaRef}
          className={textareaClassName}
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          rows={rows}
          cols={cols}
          minLength={minLength}
          maxLength={maxLength}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          spellCheck={spellCheck}
          aria-invalid={invalid ? 'true' : undefined}
          onInput={(event) => {
            onInput?.(event);
          }}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            if (value === undefined) {
              setUncontrolledValue(nextValue);
            }
            onChange?.(nextValue);
          }}
          onBlur={onBlur}
          onFocus={onFocus}
          style={{ resize }}
        />
      </div>
    );
  },
);
