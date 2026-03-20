import { useId } from 'react';
import styles from './FormHelper.module.css';

export type FormHelperTone = 'default' | 'info' | 'warning' | 'error';

export interface FormHelperProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: FormHelperTone;
  id?: string;
}

export function FormHelper({
  tone = 'default',
  id,
  className,
  role,
  'aria-live': ariaLive,
  children,
  ...props
}: FormHelperProps) {
  const generatedId = useId();
  const helperId = id ?? generatedId;
  const classes = [
    styles.root,
    tone === 'default' ? styles.muted : styles[tone],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      {...props}
      id={helperId}
      className={classes}
      role={role ?? (tone === 'error' || tone === 'warning' ? 'alert' : void 0)}
      aria-live={
        ariaLive ??
        (tone === 'error' || tone === 'warning' ? 'assertive' : 'polite')
      }
    >
      {children}
    </div>
  );
}
