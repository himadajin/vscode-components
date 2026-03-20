import { createContext } from 'react';

export type RadioGroupOrientation = 'horizontal' | 'vertical';

export type RadioGroupContextValue = {
  disabled?: boolean;
  focusedValue?: string;
  invalid?: boolean;
  name: string;
  orientation: RadioGroupOrientation;
  registerRadio: (registration: {
    disabled: boolean;
    input: HTMLInputElement | null;
    index: number;
    value: string;
  }) => () => void;
  required?: boolean;
  selectedValue?: string;
  selectValue: (value: string, options?: { focus?: boolean }) => void;
  setFocusedValue: (value: string) => void;
  tabIndexFor: (value: string, disabled: boolean) => number;
};

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(
  null,
);
