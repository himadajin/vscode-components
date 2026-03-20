import { useEffect, useState } from 'react';
import { Checkbox } from '../Checkbox';
import { Select } from '../Select';
import { TextInput } from '../TextInput';
import { isComposingKeyboardEvent } from '../../hooks/useImeGuard';
import type { ItemSchema } from '../../types/json-schema';
import styles from './ListEditor.module.css';

interface ListEditorRowProps<T> {
  value: T;
  itemSchema?: ItemSchema;
  editing: boolean;
  onStartEdit: () => void;
  onCommit: (value: T) => void;
  onCancel: () => void;
  onRemove: () => void;
  dragProps?: React.HTMLAttributes<HTMLElement> & { draggable?: boolean };
  dropTarget?: boolean;
}

function parseValue(rawValue: string, schema?: ItemSchema): unknown {
  if (!schema || schema.type === 'string') {
    return rawValue;
  }
  if (schema.type === 'boolean') {
    return rawValue === 'true';
  }
  return rawValue === '' ? '' : Number(rawValue);
}

function renderEditor(
  schema: ItemSchema | undefined,
  value: unknown,
  onChange: (value: unknown) => void,
) {
  if (schema?.type === 'boolean') {
    return (
      <Checkbox
        checked={Boolean(value)}
        onChange={onChange as (value: boolean) => void}
      />
    );
  }

  if (schema?.type === 'string' && schema.enum?.length) {
    return (
      <Select
        className={[styles.inputControl, styles.boundedInputControl].join(' ')}
        value={String(value ?? '')}
        enum={schema.enum}
        enumDescriptions={schema.enumDescriptions}
        enumItemLabels={schema.enumItemLabels}
        onChange={onChange as (value: string) => void}
      />
    );
  }

  return (
    <TextInput
      className={[
        styles.inputControl,
        schema?.type === 'string'
          ? styles.fillInputControl
          : styles.boundedInputControl,
      ].join(' ')}
      value={value as string | number | undefined}
      type={
        schema?.type === 'number' || schema?.type === 'integer'
          ? schema.type
          : 'string'
      }
      pattern={schema?.type === 'string' ? schema.pattern : undefined}
      maxLength={schema?.type === 'string' ? schema.maxLength : undefined}
      minLength={schema?.type === 'string' ? schema.minLength : undefined}
      onChange={(next) => onChange(parseValue(next, schema))}
    />
  );
}

export function ListEditorRow<T>({
  value,
  itemSchema,
  editing,
  onStartEdit,
  onCommit,
  onCancel,
  onRemove,
  dragProps,
  dropTarget = false,
}: ListEditorRowProps<T>) {
  const [draft, setDraft] = useState<unknown>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const className = [
    styles.row,
    editing ? styles.editing : '',
    dropTarget ? styles.dropTarget : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} {...dragProps}>
      {editing ? (
        <>
          <div
            className={styles.editorCell}
            onKeyDown={(event) => {
              if (isComposingKeyboardEvent(event)) {
                return;
              }
              if (event.key === 'Enter') {
                onCommit(draft as T);
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                onCancel();
              }
            }}
          >
            {renderEditor(itemSchema, draft, setDraft)}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionIcon}
              onClick={() => onCommit(draft as T)}
              aria-label="Save item"
            >
              ✓
            </button>
            <button
              type="button"
              className={styles.actionIcon}
              onClick={onCancel}
              aria-label="Cancel edit"
            >
              ×
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.value} onDoubleClick={onStartEdit}>
            {String(value)}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionIcon}
              onClick={onStartEdit}
              aria-label="Edit item"
            >
              ✎
            </button>
            <button
              type="button"
              className={styles.actionIcon}
              onClick={onRemove}
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        </>
      )}
    </div>
  );
}
