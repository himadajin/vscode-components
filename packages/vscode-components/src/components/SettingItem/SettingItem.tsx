import { Label } from '../Label';
import styles from './SettingItem.module.css';

export interface SettingItemProps {
  title: string;
  description?: string;
  category?: string;
  children: React.ReactNode;
  modified?: boolean;
  id?: string;
  className?: string;
}

export function SettingItem({
  title,
  description,
  category,
  children,
  modified = false,
  id,
  className,
}: SettingItemProps) {
  const classes = [
    styles.container,
    modified ? styles.modified : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={classes}>
      <div
        className={[
          styles.contents,
          'setting-item-contents',
          modified ? 'is-configured' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          aria-hidden="true"
          className={`${styles.modifiedIndicator} setting-item-modified-indicator`}
        />
        <Label category={category} description={description}>
          {title}
        </Label>
        <div className={`${styles.control} setting-item-value`}>
          <div className={`${styles.controlInner} setting-item-control`}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
