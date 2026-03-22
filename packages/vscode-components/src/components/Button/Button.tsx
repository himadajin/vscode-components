import { forwardRef } from 'react';
import { Icon } from '../Icon';
import styles from './Button.module.css';

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = 'primary',
      disabled,
      icon,
      iconAfter,
      type = 'button',
      onClick,
      className,
      ...props
    },
    forwardedRef,
  ) {
    const classNames = [
      styles.root,
      variant === 'secondary' ? styles.secondary : '',
      disabled ? styles.disabled : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={forwardedRef}
        className={classNames}
        disabled={disabled}
        type={type}
        data-toolbar-button="true"
        onClick={() => onClick?.()}
        {...props}
      >
        <span className={styles.content}>
          {icon ? (
            <Icon
              name={icon}
              size={16}
              className={styles.iconBefore}
              aria-hidden="true"
            />
          ) : null}
          {children}
          {iconAfter ? (
            <Icon
              name={iconAfter}
              size={16}
              className={styles.iconAfter}
              aria-hidden="true"
            />
          ) : null}
        </span>
      </button>
    );
  },
);
