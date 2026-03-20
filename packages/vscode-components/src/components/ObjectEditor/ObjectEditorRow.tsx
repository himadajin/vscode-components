import { useEffect, useMemo, useState } from 'react';
import type { ItemSchema, ObjectSettingSchema } from '../../types/json-schema';
import { Checkbox } from '../Checkbox';
import { Select } from '../Select';
import { TextInput } from '../TextInput';
import { isComposingKeyboardEvent } from '../../hooks/useImeGuard';
import styles from './ObjectEditor.module.css';

interface ObjectEditorRowProps<T> {
  entryKey: string;
  value: T;
  schema?: ObjectSettingSchema;
  defaultValue?: T;
  editing: boolean;
  onStartEdit: () => void;
  onCommit: (nextKey: string, nextValue: T) => void;
  onCancel: () => void;
  onRemove: () => void;
  onReset?: () => void;
}

function valueSchema(
  schema: ObjectSettingSchema | undefined,
  key: string,
): ItemSchema | undefined {
  if (!schema) {
    return undefined;
  }
  return (
    schema.properties?.[key] ??
    (typeof schema.additionalProperties === 'object'
      ? schema.additionalProperties
      : undefined)
  );
}

function defaultForSchema<T>(schema: ItemSchema | undefined): T {
  if (schema?.default !== undefined) {
    return schema.default as T;
  }
  if (schema?.type === 'boolean') {
    return false as T;
  }
  if (schema?.type === 'number' || schema?.type === 'integer') {
    return 0 as T;
  }
  return '' as T;
}

function renderValueEditor(
  schema: ItemSchema | undefined,
  value: unknown,
  onChange: (next: unknown) => void,
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
        className={styles.inputControl}
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
      className={styles.inputControl}
      value={value as string | number | undefined}
      type={
        schema?.type === 'number' || schema?.type === 'integer'
          ? schema.type
          : 'string'
      }
      onChange={(next) => {
        if (schema?.type === 'number' || schema?.type === 'integer') {
          onChange(next === '' ? '' : Number(next));
          return;
        }
        onChange(next);
      }}
    />
  );
}

export function ObjectEditorRow<T>({
  entryKey,
  value,
  schema,
  defaultValue,
  editing,
  onStartEdit,
  onCommit,
  onCancel,
  onRemove,
  onReset,
}: ObjectEditorRowProps<T>) {
  const [draftKey, setDraftKey] = useState(entryKey);
  const [draftValue, setDraftValue] = useState<unknown>(value);

  useEffect(() => {
    setDraftKey(entryKey);
    setDraftValue(value);
  }, [entryKey, value]);

  const keyOptions = useMemo(
    () => Object.keys(schema?.properties ?? {}),
    [schema?.properties],
  );
  const currentSchema = valueSchema(schema, draftKey);

  return (
    <div
      className={[styles.row, editing ? styles.editing : '']
        .filter(Boolean)
        .join(' ')}
    >
      {editing ? (
        <>
          <div
            onKeyDown={(event) => {
              if (isComposingKeyboardEvent(event)) {
                return;
              }
              if (event.key === 'Enter') {
                onCommit(draftKey, draftValue as T);
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                onCancel();
              }
            }}
          >
            {keyOptions.length > 0 ? (
              <Select
                className={styles.inputControl}
                value={draftKey}
                enum={keyOptions}
                onChange={(nextKey) => {
                  setDraftKey(nextKey);
                  if (schema?.properties?.[nextKey]) {
                    setDraftValue(
                      defaultForSchema<T>(schema.properties[nextKey]),
                    );
                  }
                }}
              />
            ) : (
              <TextInput
                className={styles.inputControl}
                value={draftKey}
                onChange={setDraftKey}
              />
            )}
          </div>
          <div
            onKeyDown={(event) => {
              if (isComposingKeyboardEvent(event)) {
                return;
              }
              if (event.key === 'Enter') {
                onCommit(draftKey, draftValue as T);
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                onCancel();
              }
            }}
          >
            {renderValueEditor(currentSchema, draftValue, setDraftValue)}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionIcon}
              onClick={() => onCommit(draftKey, draftValue as T)}
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
          <div className={styles.cell}>{entryKey}</div>
          <div className={styles.cell}>{String(value)}</div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.actionIcon}
              onClick={onStartEdit}
              aria-label="Edit item"
            >
              ✎
            </button>
            {onReset && defaultValue !== undefined && value !== defaultValue ? (
              <button
                type="button"
                className={styles.actionIcon}
                onClick={onReset}
                aria-label="Reset item"
              >
                Reset
              </button>
            ) : null}
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
