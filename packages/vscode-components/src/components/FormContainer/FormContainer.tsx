import styles from './FormContainer.module.css';

export type FormContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function FormContainer({
  className,
  children,
  ...props
}: FormContainerProps) {
  const classes = [styles.root, className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
