import { useEffect, useState } from 'react';
import type { ItemSchema } from '../../types/json-schema';
import {
  handleEditorKeyDown,
  SchemaValueInput,
} from '../shared/collectionEditor';
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

interface ListEditorEditingContentProps<T> {
  draft: unknown;
  itemSchema?: ItemSchema;
  onDraftChange: (value: unknown) => void;
  onCommit: (value: T) => void;
  onCancel: () => void;
}

function ListEditorEditingContent<T>({
  draft,
  itemSchema,
  onDraftChange,
  onCommit,
  onCancel,
}: ListEditorEditingContentProps<T>) {
  return (
    <>
      <div
        className={styles.editorCell}
        onKeyDown={(event) => {
          handleEditorKeyDown(event, () => onCommit(draft as T), onCancel);
        }}
      >
        <SchemaValueInput
          schema={itemSchema}
          value={draft}
          onChange={onDraftChange}
          selectClassName={[
            styles.inputControl,
            styles.boundedInputControl,
          ].join(' ')}
          textInputClassName={[
            styles.inputControl,
            itemSchema?.type === 'string'
              ? styles.fillInputControl
              : styles.boundedInputControl,
          ].join(' ')}
          includeStringValidation
        />
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
  );
}

interface ListEditorReadonlyContentProps {
  value: unknown;
  onStartEdit: () => void;
  onRemove: () => void;
}

function ListEditorReadonlyContent({
  value,
  onStartEdit,
  onRemove,
}: ListEditorReadonlyContentProps) {
  return (
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
  );
}

function getRowClassName(editing: boolean, dropTarget: boolean) {
  return [
    styles.row,
    editing ? styles.editing : '',
    dropTarget ? styles.dropTarget : '',
  ]
    .filter(Boolean)
    .join(' ');
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

  const className = getRowClassName(editing, dropTarget);

  return (
    <div className={className} {...dragProps}>
      {editing ? (
        <ListEditorEditingContent
          draft={draft}
          itemSchema={itemSchema}
          onDraftChange={setDraft}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      ) : (
        <ListEditorReadonlyContent
          value={value}
          onStartEdit={onStartEdit}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}
