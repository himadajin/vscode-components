import { forwardRef, useEffect, useRef } from 'react';
import { mergeRefs, useWebComponentEvent } from '../../hooks/useWebComponent';

export interface CheckboxProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'onChange'
> {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  toggle?: boolean;
  label?: React.ReactNode;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLElement, CheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked,
      disabled,
      indeterminate,
      toggle,
      label,
      onChange,
      ...props
    },
    forwardedRef,
  ) {
    const innerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      const element = innerRef.current as
        | (HTMLElement & { checked?: boolean; indeterminate?: boolean })
        | null;
      if (element && checked !== undefined) {
        element.checked = checked;
      }
      if (element) {
        element.indeterminate = Boolean(indeterminate);
      }
    }, [checked, indeterminate]);

    useEffect(() => {
      const element = innerRef.current as
        | (HTMLElement & { checked?: boolean })
        | null;
      if (element && checked === undefined && defaultChecked !== undefined) {
        element.checked = defaultChecked;
      }
    }, [checked, defaultChecked]);

    useWebComponentEvent(
      innerRef,
      'change',
      (element) =>
        Boolean((element as HTMLElement & { checked?: boolean }).checked),
      (nextChecked) => onChange?.(nextChecked),
    );

    return (
      <vscode-checkbox
        ref={mergeRefs(innerRef, forwardedRef)}
        checked={checked}
        disabled={disabled}
        indeterminate={indeterminate}
        {...(toggle ? { 'data-toggle': 'true' } : {})}
        {...props}
      >
        {label}
      </vscode-checkbox>
    );
  },
);
