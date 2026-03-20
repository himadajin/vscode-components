import { useState } from 'react';
import { useDragReorder } from '../../hooks/useDragReorder';
import type { ItemSchema, ListChangeEvent } from '../../types/json-schema';
import styles from './ListEditor.module.css';
import { ListEditorRow } from './ListEditorRow';

export interface ListEditorProps<T = string> {
  value: T[];
  itemSchema?: ItemSchema;
  onChange: (value: T[]) => void;
  onChangeEvent?: (event: ListChangeEvent<T>) => void;
  reorderable?: boolean;
  addPlaceholder?: string;
}

function getDefaultValue<T>(schema?: ItemSchema): T {
  if (schema?.default !== undefined) {
    return schema.default as T;
  }
  if (schema?.type === 'boolean') {
    return false as T;
  }
  if (schema?.type === 'number' || schema?.type === 'integer') {
    return 0 as T;
  }
  if (schema?.type === 'string' && schema.enum?.[0]) {
    return schema.enum[0] as T;
  }
  return '' as T;
}

export function ListEditor<T = string>({
  value,
  itemSchema,
  onChange,
  onChangeEvent,
  reorderable = true,
}: ListEditorProps<T>) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { dropIndex, getDragProps } = useDragReorder(
    value,
    (next, from, to) => {
      onChange(next);
      onChangeEvent?.({
        type: 'move',
        value: next,
        previousIndex: from,
        index: to,
        item: next[to],
      });
    },
    reorderable,
  );

  const addItem = () => {
    const next = [...value, getDefaultValue<T>(itemSchema)];
    onChange(next);
    onChangeEvent?.({
      type: 'add',
      value: next,
      index: next.length - 1,
      item: next[next.length - 1],
    });
    setEditingIndex(next.length - 1);
  };

  return (
    <div className={styles.root}>
      {value.length > 0 ? (
        <div className={styles.editor}>
          {value.map((item, index) => (
            <ListEditorRow
              key={`${index}-${String(item)}`}
              value={item}
              itemSchema={itemSchema}
              editing={editingIndex === index}
              onStartEdit={() => setEditingIndex(index)}
              onCommit={(nextItem) => {
                const next = [...value];
                next[index] = nextItem;
                onChange(next);
                onChangeEvent?.({
                  type: 'change',
                  value: next,
                  index,
                  item: nextItem,
                });
                setEditingIndex(null);
              }}
              onCancel={() => setEditingIndex(null)}
              onRemove={() => {
                const next = value.filter(
                  (_, currentIndex) => currentIndex !== index,
                );
                onChange(next);
                onChangeEvent?.({ type: 'remove', value: next, index, item });
                setEditingIndex((current) =>
                  current === index ? null : current,
                );
              }}
              dragProps={getDragProps(index)}
              dropTarget={dropIndex === index}
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
