import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  RadioGroupContext,
  type RadioGroupOrientation,
} from '../shared/radioGroupContext';
import styles from './RadioGroup.module.css';

type RegisteredRadio = {
  disabled: boolean;
  index: number;
  input: HTMLInputElement | null;
  value: string;
};

export interface RadioGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'defaultValue' | 'onChange'
> {
  children?: React.ReactNode;
  defaultValue?: string;
  disabled?: boolean;
  invalid?: boolean;
  name?: string;
  onChange?: (value: string) => void;
  orientation?: RadioGroupOrientation;
  required?: boolean;
  value?: string;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    {
      children,
      className,
      defaultValue,
      disabled,
      invalid,
      name,
      onChange,
      orientation = 'horizontal',
      required,
      value,
      ...props
    },
    forwardedRef,
  ) {
    const generatedName = useRef(
      name ??
        `vscode-components-radio-group-${Math.random().toString(36).slice(2)}`,
    );
    const radiosRef = useRef<Map<string, RegisteredRadio>>(new Map());
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const [focusedValue, setFocusedValue] = useState<string>();

    const selectedValue = value ?? uncontrolledValue;

    useEffect(() => {
      if (selectedValue !== undefined) {
        setFocusedValue(selectedValue);
      }
    }, [selectedValue]);

    const contextValue = useMemo(() => {
      const getSortedRadios = () =>
        Array.from(radiosRef.current.values()).sort((left, right) => {
          return left.index - right.index;
        });

      const getEnabledRadios = () =>
        getSortedRadios().filter((radio) => !radio.disabled);

      const focusRadio = (nextValue: string) => {
        const nextRadio = radiosRef.current.get(nextValue)?.input;
        if (nextRadio) {
          requestAnimationFrame(() => nextRadio.focus());
        }
      };

      return {
        disabled,
        focusedValue,
        invalid,
        name: generatedName.current,
        orientation,
        registerRadio(registration: RegisteredRadio) {
          radiosRef.current.set(registration.value, registration);
          return () => {
            radiosRef.current.delete(registration.value);
          };
        },
        required,
        selectedValue,
        selectValue(nextValue: string, options?: { focus?: boolean }) {
          if (value === undefined) {
            setUncontrolledValue(nextValue);
          }
          setFocusedValue(nextValue);

          if (selectedValue !== nextValue) {
            onChange?.(nextValue);
          }

          if (options?.focus) {
            focusRadio(nextValue);
          }
        },
        setFocusedValue(nextValue: string) {
          setFocusedValue(nextValue);
        },
        tabIndexFor(radioValue: string, radioDisabled: boolean) {
          if (radioDisabled) {
            return -1;
          }

          const enabledRadios = getEnabledRadios();
          const fallbackValue = enabledRadios[0]?.value;
          const activeValue = focusedValue ?? selectedValue ?? fallbackValue;

          return activeValue === radioValue ? 0 : -1;
        },
      };
    }, [
      disabled,
      focusedValue,
      invalid,
      onChange,
      orientation,
      required,
      selectedValue,
      value,
    ]);

    const items = Children.map(children, (child, index) => {
      if (!isValidElement(child)) {
        return child;
      }

      return cloneElement(
        child as React.ReactElement<Record<string, unknown>>,
        {
          'data-radio-index': index,
        },
      );
    });

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          {...props}
          ref={forwardedRef}
          aria-invalid={invalid || undefined}
          className={joinClasses(styles.root, className)}
          role="radiogroup"
        >
          <div
            className={joinClasses(
              styles.wrapper,
              orientation === 'vertical' && styles.vertical,
            )}
          >
            {items}
          </div>
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
