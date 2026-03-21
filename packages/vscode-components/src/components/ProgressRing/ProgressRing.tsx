import { forwardRef } from 'react';
import styles from './ProgressRing.module.css';

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  ariaLabel?: string;
  mode?: 'infinite' | 'discrete';
  total?: number;
  value?: number;
  visible?: boolean;
  done?: boolean;
  longRunning?: boolean;
}

export const ProgressRing = forwardRef<HTMLDivElement, ProgressRingProps>(
  function ProgressRing(
    {
      ariaLabel = 'Progress',
      mode,
      total = 100,
      value,
      visible = true,
      done,
      longRunning = false,
      className,
      style,
      ...props
    },
    forwardedRef,
  ) {
    const resolvedMode =
      mode ?? (value === undefined ? 'infinite' : 'discrete');
    const safeTotal = Math.max(1, total);
    const safeValue =
      value === undefined
        ? 0
        : Math.min(safeTotal, Math.max(1, Number(value) || 0));
    const percent = `${100 * (safeValue / safeTotal)}%`;
    const isDone =
      done ?? (resolvedMode === 'discrete' && safeValue >= safeTotal);

    const classes = [
      styles.root,
      visible ? styles.active : styles.hidden,
      resolvedMode === 'infinite' ? styles.infinite : styles.discrete,
      longRunning ? styles.longRunning : '',
      isDone ? styles.done : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const ariaProps =
      resolvedMode === 'discrete'
        ? {
            'aria-valuemin': 0,
            'aria-valuemax': safeTotal,
            'aria-valuenow': safeValue,
          }
        : {};

    return (
      <div
        ref={forwardedRef}
        className={classes}
        role="progressbar"
        aria-label={ariaLabel}
        {...ariaProps}
        {...props}
      >
        <div
          className={styles.bit}
          style={{
            ...style,
            width:
              resolvedMode === 'discrete'
                ? isDone
                  ? 'inherit'
                  : percent
                : '2%',
            opacity: isDone && resolvedMode === 'infinite' ? '0' : '1',
          }}
        />
      </div>
    );
  },
);
