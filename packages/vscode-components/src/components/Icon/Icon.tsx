import { forwardRef, useMemo } from 'react';
import styles from './Icon.module.css';

const themeIconRegex = /^\$\(([A-Za-z0-9-]+)(?:~([A-Za-z]+))?\)$/;
const iconIdRegex = /^([A-Za-z0-9-]+)(?:~([A-Za-z]+))?$/;

type IconDescriptor = {
  name: string;
  modifier?: string;
};

export interface IconProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'children' | 'onClick'
> {
  name?: string;
  icon?: string;
  size?: number;
  spin?: boolean;
  actionIcon?: boolean;
  disabled?: boolean;
  label?: string;
  onClick?: () => void;
}

function parseIconDescriptor(value?: string): IconDescriptor | undefined {
  if (!value) {
    return undefined;
  }

  const match = themeIconRegex.exec(value) ?? iconIdRegex.exec(value);
  if (!match) {
    return undefined;
  }

  const [, name, modifier] = match;
  return { name, modifier };
}

export const Icon = forwardRef<HTMLElement, IconProps>(function Icon(
  {
    name,
    icon,
    size = 16,
    spin,
    actionIcon,
    disabled,
    label,
    className,
    onClick,
    ...props
  },
  forwardedRef,
) {
  const descriptor = useMemo(
    () => parseIconDescriptor(icon) ?? parseIconDescriptor(name),
    [icon, name],
  );

  if (!descriptor) {
    return null;
  }

  const modifier = descriptor.modifier;
  const isSpinning = spin ?? modifier === 'spin';
  const iconClassName = [
    'codicon',
    `codicon-${descriptor.name}`,
    modifier && modifier !== 'spin' ? `codicon-modifier-${modifier}` : '',
    styles.glyph,
  ]
    .filter(Boolean)
    .join(' ');

  const style = {
    fontSize: `${size}px`,
    height: `${size}px`,
    width: `${size}px`,
  } satisfies React.CSSProperties;

  const rootClassName = [styles.root, className ?? '']
    .filter(Boolean)
    .join(' ');

  if (actionIcon) {
    return (
      <button
        ref={forwardedRef as React.Ref<HTMLButtonElement>}
        type="button"
        className={[rootClassName, styles.action].filter(Boolean).join(' ')}
        aria-label={label}
        disabled={disabled}
        onClick={() => onClick?.()}
        {...props}
      >
        <span
          className={[iconClassName, isSpinning ? 'codicon-modifier-spin' : '']
            .filter(Boolean)
            .join(' ')}
          style={style}
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <span
      ref={forwardedRef as React.Ref<HTMLSpanElement>}
      className={rootClassName}
      role="presentation"
      aria-hidden="true"
      {...props}
    >
      <span
        className={[iconClassName, isSpinning ? 'codicon-modifier-spin' : '']
          .filter(Boolean)
          .join(' ')}
        style={style}
        aria-hidden="true"
      />
    </span>
  );
});
