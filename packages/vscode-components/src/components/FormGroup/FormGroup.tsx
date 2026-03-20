import { cloneElement, isValidElement, useId } from 'react';
import type { FormHelperProps } from '../FormHelper';
import { FormHelper } from '../FormHelper';
import styles from './FormGroup.module.css';

type ControlElementProps = {
  id?: string;
  'aria-describedby'?: string;
};

export interface FormGroupProps extends React.HTMLAttributes<HTMLElement> {
  label: React.ReactNode;
  description?: React.ReactNode;
  helper?: React.ReactNode;
  children: React.ReactNode;
  modified?: boolean;
  controlId?: string;
  fill?: boolean;
}

function mergeDescribedBy(
  existing: string | undefined,
  nextId: string | undefined,
) {
  return [existing, nextId].filter(Boolean).join(' ') || undefined;
}

export function FormGroup({
  label,
  description,
  helper,
  children,
  modified = false,
  controlId,
  fill = false,
  className,
  ...props
}: FormGroupProps) {
  const generatedControlId = useId();
  const generatedDescriptionId = useId();
  const generatedHelperId = useId();
  const resolvedControlId = controlId ?? generatedControlId;
  const descriptionId = description ? generatedDescriptionId : undefined;
  const helperId = helper ? generatedHelperId : undefined;
  const describedBy = mergeDescribedBy(descriptionId, helperId);
  const classes = [
    styles.root,
    modified ? styles.modified : '',
    fill ? styles.fill : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const controlElement = isValidElement<ControlElementProps>(children)
    ? children
    : null;
  const control = isValidElement(children)
    ? cloneElement(controlElement!, {
        id: controlElement?.props.id ?? resolvedControlId,
        'aria-describedby': mergeDescribedBy(
          controlElement?.props['aria-describedby'],
          describedBy,
        ),
      })
    : children;

  return (
    <section className={classes} {...props}>
      <div className={styles.header}>
        <label className={styles.label} htmlFor={resolvedControlId}>
          {label}
        </label>
      </div>
      {description ? (
        <div id={descriptionId} className={styles.description}>
          {description}
        </div>
      ) : null}
      <div className={styles.control}>{control}</div>
      {helper ? (
        <div className={styles.helper}>
          {isValidElement(helper) ? (
            cloneElement(helper as React.ReactElement<FormHelperProps>, {
              id: (helper.props as { id?: string }).id ?? helperId,
            })
          ) : (
            <FormHelper id={helperId}>{helper}</FormHelper>
          )}
        </div>
      ) : null}
    </section>
  );
}
