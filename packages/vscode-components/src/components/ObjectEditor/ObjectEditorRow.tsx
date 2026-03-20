import { useEffect, useState } from 'react';
import type { ItemSchema, ObjectSettingSchema } from '../../types/json-schema';
import { Icon } from '../Icon';
import { Select } from '../Select';
import { TextInput } from '../TextInput';
import {
  getDefaultItemValue,
  getObjectValueSchema,
  handleEditorKeyDown,
  SchemaValueInput,
} from '../shared/collectionEditor';
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

interface ObjectEditorKeyInputProps {
  draftKey: string;
  schema?: ObjectSettingSchema;
  onDraftKeyChange: (draftKey: string) => void;
  onDraftValueChange: (draftValue: unknown) => void;
}

function ObjectEditorKeyInput({
  draftKey,
  schema,
  onDraftKeyChange,
  onDraftValueChange,
}: ObjectEditorKeyInputProps) {
  const keyOptions = Object.keys(schema?.properties ?? {});

  if (keyOptions.length > 0) {
    return (
      <Select
        className={styles.inputControl}
        value={draftKey}
        enum={keyOptions}
        onChange={(nextKey) => {
          onDraftKeyChange(nextKey);
          if (schema?.properties?.[nextKey]) {
            onDraftValueChange(getDefaultItemValue(schema.properties[nextKey]));
          }
        }}
      />
    );
  }

  return (
    <TextInput
      className={styles.inputControl}
      value={draftKey}
      onChange={onDraftKeyChange}
    />
  );
}

interface ObjectEditorEditingContentProps<T> {
  draftKey: string;
  draftValue: unknown;
  schema?: ObjectSettingSchema;
  currentSchema?: ItemSchema;
  onDraftKeyChange: (draftKey: string) => void;
  onDraftValueChange: (draftValue: unknown) => void;
  onCommit: (nextKey: string, nextValue: T) => void;
  onCancel: () => void;
}

function ObjectEditorEditingContent<T>({
  draftKey,
  draftValue,
  schema,
  currentSchema,
  onDraftKeyChange,
  onDraftValueChange,
  onCommit,
  onCancel,
}: ObjectEditorEditingContentProps<T>) {
  const commitDraft = () => {
    onCommit(draftKey, draftValue as T);
  };

  return (
    <>
      <div
        onKeyDown={(event) => {
          handleEditorKeyDown(event, commitDraft, onCancel);
        }}
      >
        <ObjectEditorKeyInput
          draftKey={draftKey}
          schema={schema}
          onDraftKeyChange={onDraftKeyChange}
          onDraftValueChange={onDraftValueChange}
        />
      </div>
      <div
        onKeyDown={(event) => {
          handleEditorKeyDown(event, commitDraft, onCancel);
        }}
      >
        <SchemaValueInput
          schema={currentSchema}
          value={draftValue}
          onChange={onDraftValueChange}
          selectClassName={styles.inputControl}
          textInputClassName={styles.inputControl}
        />
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.textAction}
          onClick={commitDraft}
          aria-label="Save item"
        >
          OK
        </button>
        <button
          type="button"
          className={styles.textActionSecondary}
          onClick={onCancel}
          aria-label="Cancel edit"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

interface ObjectEditorReadonlyContentProps<T> {
  entryKey: string;
  value: T;
  defaultValue?: T;
  onStartEdit: () => void;
  onRemove: () => void;
  onReset?: () => void;
}

function ObjectEditorReadonlyContent<T>({
  entryKey,
  value,
  defaultValue,
  onStartEdit,
  onRemove,
  onReset,
}: ObjectEditorReadonlyContentProps<T>) {
  return (
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
          <Icon name="edit" />
        </button>
        {onReset && defaultValue !== undefined && value !== defaultValue ? (
          <button
            type="button"
            className={styles.actionIcon}
            onClick={onReset}
            aria-label="Reset item"
          >
            <Icon name="discard" />
          </button>
        ) : null}
        <button
          type="button"
          className={styles.actionIcon}
          onClick={onRemove}
          aria-label="Remove item"
        >
          <Icon name="trash" />
        </button>
      </div>
    </>
  );
}

function getRowClassName(editing: boolean) {
  return [styles.row, editing ? styles.editing : ''].filter(Boolean).join(' ');
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

  const currentSchema = getObjectValueSchema(schema, draftKey);

  return (
    <div className={getRowClassName(editing)}>
      {editing ? (
        <ObjectEditorEditingContent
          draftKey={draftKey}
          draftValue={draftValue}
          schema={schema}
          currentSchema={currentSchema}
          onDraftKeyChange={setDraftKey}
          onDraftValueChange={setDraftValue}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      ) : (
        <ObjectEditorReadonlyContent
          entryKey={entryKey}
          value={value}
          defaultValue={defaultValue}
          onStartEdit={onStartEdit}
          onRemove={onRemove}
          onReset={onReset}
        />
      )}
    </div>
  );
}
