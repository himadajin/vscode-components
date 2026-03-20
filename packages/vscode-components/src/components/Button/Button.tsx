import { forwardRef, useRef } from 'react';
import { mergeRefs, useWebComponentEvent } from '../../hooks/useWebComponent';

export interface ButtonProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'onClick'
> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: string;
  iconAfter?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

export const Button = forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    disabled,
    icon,
    iconAfter,
    type = 'button',
    onClick,
    ...props
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLElement | null>(null);
  useWebComponentEvent(
    innerRef,
    'click',
    () => undefined,
    () => onClick?.(),
  );

  return (
    <vscode-button
      ref={mergeRefs(innerRef, forwardedRef)}
      secondary={variant === 'secondary'}
      disabled={disabled}
      type={type}
      {...(icon ? { icon } : {})}
      {...(iconAfter ? { 'icon-after': iconAfter } : {})}
      {...props}
    >
      {children}
    </vscode-button>
  );
});
