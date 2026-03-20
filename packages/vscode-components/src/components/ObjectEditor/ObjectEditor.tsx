import { useState } from 'react';
import type {
  ObjectChangeEvent,
  ObjectSettingSchema,
} from '../../types/json-schema';
import styles from './ObjectEditor.module.css';
import { ObjectEditorRow } from './ObjectEditorRow';

export interface ObjectEditorProps<T = string> {
  value: Record<string, T>;
  schema?: ObjectSettingSchema;
  onChange: (value: Record<string, T>) => void;
  onChangeEvent?: (event: ObjectChangeEvent<T>) => void;
  defaultValue?: Record<string, T>;
}

function defaultEntry<T>(schema?: ObjectSettingSchema): [string, T] {
  const firstKey = Object.keys(schema?.properties ?? {})[0] ?? '';
  const propSchema = firstKey ? schema?.properties?.[firstKey] : undefined;
  const fallback =
    propSchema?.default ??
    (propSchema?.type === 'boolean'
      ? false
      : propSchema?.type === 'number' || propSchema?.type === 'integer'
        ? 0
        : '');
  return [firstKey, fallback as T];
}

function getUniqueKey<T>(
  value: Record<string, T>,
  schema: ObjectSettingSchema | undefined,
  preferredKey: string,
): string {
  if (preferredKey && value[preferredKey] === undefined) {
    return preferredKey;
  }

  const schemaKeys = Object.keys(schema?.properties ?? {});
  const nextSchemaKey = schemaKeys.find((key) => value[key] === undefined);
  if (nextSchemaKey) {
    return nextSchemaKey;
  }

  let index = Object.keys(value).length + 1;
  let fallbackKey = `key${index}`;

  while (value[fallbackKey] !== undefined) {
    index += 1;
    fallbackKey = `key${index}`;
  }

  return fallbackKey;
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

  const addItem = () => {
    const [key, nextValue] = defaultEntry<T>(schema);
    const resolvedKey = getUniqueKey(value, schema, key);
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
      {entries.length > 0 ? (
        <div className={styles.editor}>
          <div className={styles.header}>
            <div>Item</div>
            <div>Value</div>
            <div />
          </div>
          {entries.map(([entryKey, entryValue]) => (
            <ObjectEditorRow
              key={entryKey}
              entryKey={entryKey}
              value={entryValue}
              schema={schema}
              defaultValue={defaultValue?.[entryKey]}
              editing={editingKey === entryKey}
              onStartEdit={() => setEditingKey(entryKey)}
              onCommit={(nextKey, nextValue) => {
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
              }}
              onCancel={() => setEditingKey(null)}
              onRemove={() => {
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
              }}
              onReset={
                defaultValue?.[entryKey] !== undefined
                  ? () => {
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
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ) : null}
      <div className={styles.footer}>
        <button type="button" className={styles.addButton} onClick={addItem}>
          Add Item
        </button>
      </div>
    </div>
  );
}
