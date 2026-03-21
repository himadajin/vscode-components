import { forwardRef } from 'react';
import styles from './ToolbarButton.module.css';

export interface ToolbarButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick'
> {
  icon?: string;
  label?: string;
  checked?: boolean;
  toggleable?: boolean;
  onClick?: () => void;
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  function ToolbarButton(
    {
      icon,
      label,
      checked = false,
      toggleable = false,
      disabled,
      children,
      className,
      onClick,
      type = 'button',
      ...props
    },
    forwardedRef,
  ) {
    const text = children ?? label;
    const iconOnly = !text;
    const iconClassName = icon
      ? ['codicon', `codicon-${icon}`, styles.codicon].join(' ')
      : '';

    return (
      <button
        ref={forwardedRef}
        type={type}
        className={[
          styles.button,
          checked ? styles.checked : '',
          iconOnly ? styles.iconOnly : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        data-toolbar-button="true"
        aria-label={iconOnly ? label : props['aria-label']}
        aria-pressed={toggleable ? checked : undefined}
        onClick={() => onClick?.()}
        {...props}
      >
        <span className={styles.content}>
          {icon ? <span className={iconClassName} aria-hidden="true" /> : null}
          {text ? <span className={styles.label}>{text}</span> : null}
        </span>
      </button>
    );
  },
);
