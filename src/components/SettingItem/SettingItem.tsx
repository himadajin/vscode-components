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
      {category ? <div className={styles.category}>{category}</div> : null}
      <div className={styles.title}>{title}</div>
      {description ? (
        <div className={styles.description}>{description}</div>
      ) : null}
      <div className={styles.control}>{children}</div>
    </section>
  );
}
