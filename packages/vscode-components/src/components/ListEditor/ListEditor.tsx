import { useState } from 'react';
import { useDragReorder } from '../../hooks/useDragReorder';
import type { ItemSchema, ListChangeEvent } from '../../types/json-schema';
import { getDefaultItemValue } from '../shared/collectionEditor';
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

interface ListEditorRowsProps<T> {
  value: T[];
  itemSchema?: ItemSchema;
  editingIndex: number | null;
  dropIndex: number | null;
  getDragProps: ReturnType<typeof useDragReorder<T>>['getDragProps'];
  onStartEdit: (index: number) => void;
  onCommit: (index: number, nextItem: T) => void;
  onCancel: () => void;
  onRemove: (index: number, item: T) => void;
}

function ListEditorRows<T>({
  value,
  itemSchema,
  editingIndex,
  dropIndex,
  getDragProps,
  onStartEdit,
  onCommit,
  onCancel,
  onRemove,
}: ListEditorRowsProps<T>) {
  if (value.length === 0) {
    return null;
  }

  return (
    <div className={styles.editor}>
      {value.map((item, index) => (
        <ListEditorRow
          key={`${index}-${String(item)}`}
          value={item}
          itemSchema={itemSchema}
          editing={editingIndex === index}
          onStartEdit={() => onStartEdit(index)}
          onCommit={(nextItem) => onCommit(index, nextItem)}
          onCancel={onCancel}
          onRemove={() => onRemove(index, item)}
          dragProps={getDragProps(index)}
          dropTarget={dropIndex === index}
        />
      ))}
    </div>
  );
}

interface ListEditorFooterProps {
  onAddItem: () => void;
}

function ListEditorFooter({ onAddItem }: ListEditorFooterProps) {
  return (
    <div className={styles.footer}>
      <button type="button" className={styles.addButton} onClick={onAddItem}>
        Add Item
      </button>
    </div>
  );
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

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleCommit = (index: number, nextItem: T) => {
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
  };

  const handleCancel = () => {
    setEditingIndex(null);
  };

  const handleRemove = (index: number, item: T) => {
    const next = value.filter((_, currentIndex) => currentIndex !== index);
    onChange(next);
    onChangeEvent?.({ type: 'remove', value: next, index, item });
    setEditingIndex((current) => (current === index ? null : current));
  };

  const addItem = () => {
    const next = [
      ...value,
      getDefaultItemValue<T>(itemSchema, { preferEnum: true }),
    ];
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
      <ListEditorRows
        value={value}
        itemSchema={itemSchema}
        editingIndex={editingIndex}
        dropIndex={dropIndex}
        getDragProps={getDragProps}
        onStartEdit={handleStartEdit}
        onCommit={handleCommit}
        onCancel={handleCancel}
        onRemove={handleRemove}
      />
      <ListEditorFooter onAddItem={addItem} />
    </div>
  );
}
