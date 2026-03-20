import { useState } from 'react';
import type {
  ObjectChangeEvent,
  ObjectSettingSchema,
} from '../../types/json-schema';
import {
  getDefaultObjectEntry,
  getUniqueObjectKey,
} from '../shared/collectionEditor';
import styles from './ObjectEditor.module.css';
import { ObjectEditorRow } from './ObjectEditorRow';

export interface ObjectEditorProps<T = string> {
  value: Record<string, T>;
  schema?: ObjectSettingSchema;
  onChange: (value: Record<string, T>) => void;
  onChangeEvent?: (event: ObjectChangeEvent<T>) => void;
  defaultValue?: Record<string, T>;
}

interface ObjectEditorHeaderProps {
  visible: boolean;
}

function ObjectEditorHeader({ visible }: ObjectEditorHeaderProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className={styles.header}>
      <div>Item</div>
      <div>Value</div>
      <div />
    </div>
  );
}

interface ObjectEditorRowsProps<T> {
  entries: [string, T][];
  schema?: ObjectSettingSchema;
  defaultValue?: Record<string, T>;
  editingKey: string | null;
  onStartEdit: (entryKey: string) => void;
  onCommit: (entryKey: string, nextKey: string, nextValue: T) => void;
  onCancel: () => void;
  onRemove: (entryKey: string, entryValue: T) => void;
  onReset: (entryKey: string) => void;
}

function ObjectEditorRows<T>({
  entries,
  schema,
  defaultValue,
  editingKey,
  onStartEdit,
  onCommit,
  onCancel,
  onRemove,
  onReset,
}: ObjectEditorRowsProps<T>) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={styles.editor}>
      <ObjectEditorHeader visible={entries.length > 0} />
      {entries.map(([entryKey, entryValue]) => (
        <ObjectEditorRow
          key={entryKey}
          entryKey={entryKey}
          value={entryValue}
          schema={schema}
          defaultValue={defaultValue?.[entryKey]}
          editing={editingKey === entryKey}
          onStartEdit={() => onStartEdit(entryKey)}
          onCommit={(nextKey, nextValue) =>
            onCommit(entryKey, nextKey, nextValue)
          }
          onCancel={onCancel}
          onRemove={() => onRemove(entryKey, entryValue)}
          onReset={
            defaultValue?.[entryKey] !== undefined
              ? () => onReset(entryKey)
              : undefined
          }
        />
      ))}
    </div>
  );
}

interface ObjectEditorFooterProps {
  onAddItem: () => void;
}

function ObjectEditorFooter({ onAddItem }: ObjectEditorFooterProps) {
  return (
    <div className={styles.footer}>
      <button type="button" className={styles.addButton} onClick={onAddItem}>
        Add Item
      </button>
    </div>
  );
}

export function ObjectEditor<T = string>({
  value,
  schema,
  onChange,
  onChangeEvent,
  defaultValue,
}: ObjectEditorProps<T>) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const entries = Object.entries(value);

  const handleStartEdit = (entryKey: string) => {
    setEditingKey(entryKey);
  };

  const handleCommit = (entryKey: string, nextKey: string, nextValue: T) => {
    const next = { ...value };
    if (nextKey !== entryKey) {
      delete next[entryKey];
    }
    next[nextKey] = nextValue;
    onChange(next);
    onChangeEvent?.({
      type: 'change',
      value: next,
      key: nextKey,
      previousKey: nextKey !== entryKey ? entryKey : undefined,
      item: nextValue,
    });
    setEditingKey(null);
  };

  const handleCancel = () => {
    setEditingKey(null);
  };

  const handleRemove = (entryKey: string, entryValue: T) => {
    const next = { ...value };
    delete next[entryKey];
    onChange(next);
    onChangeEvent?.({
      type: 'remove',
      value: next,
      key: entryKey,
      item: entryValue,
    });
    setEditingKey(null);
  };

  const handleReset = (entryKey: string) => {
    if (defaultValue?.[entryKey] === undefined) {
      return;
    }

    const next = {
      ...value,
      [entryKey]: defaultValue[entryKey],
    };
    onChange(next);
    onChangeEvent?.({
      type: 'reset',
      value: next,
      key: entryKey,
      item: defaultValue[entryKey],
    });
  };

  const addItem = () => {
    const [key, nextValue] = getDefaultObjectEntry<T>(schema);
    const resolvedKey = getUniqueObjectKey(value, schema, key);
    const next = { ...value, [resolvedKey]: nextValue };
    onChange(next);
    onChangeEvent?.({
      type: 'add',
      value: next,
      key: resolvedKey,
      item: nextValue,
    });
    setEditingKey(resolvedKey);
  };

  return (
    <div className={styles.root}>
      <ObjectEditorRows
        entries={entries}
        schema={schema}
        defaultValue={defaultValue}
        editingKey={editingKey}
        onStartEdit={handleStartEdit}
        onCommit={handleCommit}
        onCancel={handleCancel}
        onRemove={handleRemove}
        onReset={handleReset}
      />
      <ObjectEditorFooter onAddItem={addItem} />
    </div>
  );
}
