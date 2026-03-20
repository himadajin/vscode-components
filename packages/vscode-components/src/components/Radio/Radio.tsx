import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { mergeRefs } from '../../hooks/useWebComponent';
import { RadioGroupContext } from '../shared/radioGroupContext';
import styles from './Radio.module.css';

type RadioKey = 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp';

const radioArrowDirections: Record<RadioKey, -1 | 1> = {
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
};

export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'children' | 'onChange' | 'size' | 'type'
> {
  'data-radio-index'?: number;
  children?: React.ReactNode;
  invalid?: boolean;
  label?: React.ReactNode;
  onChange?: (checked: boolean, value: string) => void;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    checked,
    children,
    className,
    defaultChecked,
    disabled,
    id,
    invalid,
    label,
    name,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    required,
    style,
    value = '',
    'data-radio-index': radioIndex,
    ...inputProps
  },
  forwardedRef,
) {
  const generatedId = useId();
  const group = useContext(RadioGroupContext);
  const innerRef = useRef<HTMLInputElement | null>(null);
  const [uncontrolledChecked, setUncontrolledChecked] = useState(
    Boolean(defaultChecked),
  );

  const resolvedId = id ?? generatedId;
  const resolvedDisabled = Boolean(group?.disabled || disabled);
  const resolvedInvalid = Boolean(group?.invalid || invalid);
  const resolvedName = group?.name ?? name;
  const resolvedRequired = Boolean(group?.required || required);
  const resolvedRadioIndex =
    typeof radioIndex === 'number' || typeof radioIndex === 'string'
      ? radioIndex
      : undefined;
  const resolvedChecked = group
    ? group.selectedValue === String(value)
    : (checked ?? uncontrolledChecked);
  const content = children ?? label;

  useEffect(() => {
    if (!group) {
      return;
    }

    return group.registerRadio({
      disabled: resolvedDisabled,
      index: Number(resolvedRadioIndex ?? 0),
      input: innerRef.current,
      value: String(value),
    });
  }, [group, resolvedDisabled, resolvedRadioIndex, value]);

  const handleSelect = (focus = false) => {
    if (resolvedDisabled || resolvedChecked) {
      return;
    }

    if (group) {
      group.selectValue(String(value), { focus });
    } else if (checked === undefined) {
      setUncontrolledChecked(true);
    }

    onChange?.(true, String(value));
  };

  const handleChange = () => {
    handleSelect(false);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
    group?.setFocusedValue(String(value));
    onFocus?.(event);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const key = event.key as RadioKey;

    if (group && key in radioArrowDirections) {
      event.preventDefault();
      event.stopPropagation();
      group.selectValue(String(value), { focus: true });

      const current = innerRef.current;
      const radios = current
        ?.closest('[role="radiogroup"]')
        ?.querySelectorAll<HTMLInputElement>('input[type="radio"]');

      if (current && radios?.length) {
        const enabled = Array.from(radios).filter((radio) => !radio.disabled);
        const currentIndex = enabled.findIndex((radio) => radio === current);
        const nextIndex =
          currentIndex === -1
            ? 0
            : (currentIndex + radioArrowDirections[key] + enabled.length) %
              enabled.length;
        const nextRadio = enabled[nextIndex];

        if (nextRadio) {
          nextRadio.click();
          nextRadio.focus();
        }
      }

      onKeyDown?.(event);
      return;
    }

    if ((event.key === ' ' || event.key === 'Enter') && !resolvedChecked) {
      event.preventDefault();
      event.stopPropagation();
      handleSelect(true);
    }

    onKeyDown?.(event);
  };

  return (
    <label
      className={joinClasses(
        styles.root,
        resolvedChecked && styles.checked,
        resolvedDisabled && styles.disabled,
        resolvedInvalid && styles.invalid,
        !content && styles.empty,
        className,
      )}
      data-orientation={group?.orientation}
      style={style}
    >
      <input
        {...inputProps}
        data-radio-index={resolvedRadioIndex}
        ref={mergeRefs(innerRef, forwardedRef)}
        checked={resolvedChecked}
        className={styles.input}
        disabled={resolvedDisabled}
        id={resolvedId}
        name={resolvedName}
        onBlur={onBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        required={resolvedRequired}
        tabIndex={group?.tabIndexFor(String(value), resolvedDisabled)}
        type="radio"
        value={value}
      />
      <span className={styles.control} aria-hidden="true">
        <span className={styles.dot} />
      </span>
      {content ? <span className={styles.content}>{content}</span> : null}
    </label>
  );
});
