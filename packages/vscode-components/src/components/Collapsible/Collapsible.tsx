import { useEffect, useId, useState } from 'react';
import { Icon } from '../Icon';
import styles from './Collapsible.module.css';

export interface CollapsibleProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  actions?: React.ReactNode;
  decorations?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function Collapsible({
  title,
  description,
  children,
  open,
  defaultOpen = false,
  disabled = false,
  actions,
  decorations,
  onOpenChange,
  className,
  id,
  ...props
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;
  const reactId = useId();
  const contentId = `${id ?? reactId}-content`;

  useEffect(() => {
    if (!isControlled) {
      setUncontrolledOpen(defaultOpen);
    }
  }, [defaultOpen, isControlled]);

  const toggle = () => {
    if (disabled) {
      return;
    }

    const nextOpen = !isOpen;
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const classes = [styles.root, isOpen ? styles.rootOpen : '', className ?? '']
    .filter(Boolean)
    .join(' ');

  return (
    <div id={id} className={classes} {...props}>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.trigger}
          aria-expanded={isOpen}
          aria-controls={contentId}
          disabled={disabled}
          onClick={toggle}
        >
          <Icon
            name={isOpen ? 'chevron-down' : 'chevron-right'}
            size={16}
            className={styles.icon}
          />
          <span className={styles.title}>
            {title}
            {description ? (
              <span className={styles.description}>{description}</span>
            ) : null}
          </span>
        </button>
        {(decorations || actions) && (
          <div className={styles.headerSlots}>
            {decorations ? (
              <div className={styles.decorations}>{decorations}</div>
            ) : null}
            {actions ? (
              <div
                className={[styles.actions, isOpen ? styles.actionsOpen : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {actions}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div
        id={contentId}
        className={[styles.body, isOpen ? styles.bodyOpen : '']
          .filter(Boolean)
          .join(' ')}
        hidden={!isOpen}
      >
        {children}
      </div>
    </div>
  );
}
