import styles from './Label.module.css';

export interface LabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  category?: React.ReactNode;
  description?: React.ReactNode;
  descriptionId?: string;
  htmlFor?: string;
}

export function Label({
  children,
  category,
  description,
  descriptionId,
  htmlFor,
  className,
  ...props
}: LabelProps) {
  const classes = [styles.root, className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      <div className={`${styles.title} setting-item-title`}>
        {category ? (
          <span className={`${styles.category} setting-item-category`}>
            {category}
          </span>
        ) : null}
        {htmlFor ? (
          <label
            className={`${styles.label} setting-item-label`}
            htmlFor={htmlFor}
          >
            {children}
          </label>
        ) : (
          <span className={`${styles.label} setting-item-label`}>
            {children}
          </span>
        )}
      </div>
      {description ? (
        <div
          id={descriptionId}
          className={`${styles.description} setting-item-description`}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}
