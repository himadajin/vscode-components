import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../Button';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { Icon } from '../Icon';
import { TextInput } from '../TextInput';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  tableClassNames,
} from './Table';

const meta = {
  title: 'Composite/Table',
  component: Table,
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

type ComparisonRowData = {
  id: string;
  key: string;
  value: string;
  defaultValue: string;
  invalid?: boolean;
  isNew?: boolean;
  resettable?: boolean;
  removable?: boolean;
};

type ListRowData = {
  id: string;
  value: string;
  sibling: string;
  isNew?: boolean;
};

function resolveNextSelectedRowId<T extends { id: string }>(
  rows: T[],
  removedRowId: string,
  selectedRowId: string | null,
) {
  if (selectedRowId !== removedRowId) {
    return selectedRowId;
  }

  const removedIndex = rows.findIndex((row) => row.id === removedRowId);
  const nextRows = rows.filter((row) => row.id !== removedRowId);
  const nextRow = nextRows[Math.min(removedIndex, nextRows.length - 1)];

  return nextRow?.id ?? null;
}

function ActionButtons({
  onEdit,
  onReset,
  onRemove,
}: {
  onEdit: () => void;
  onReset?: () => void;
  onRemove?: () => void;
}) {
  return (
    <>
      <Icon actionIcon name="edit" label="Edit row" onClick={onEdit} />
      {onReset ? (
        <Icon actionIcon name="discard" label="Reset row" onClick={onReset} />
      ) : null}
      {onRemove ? (
        <Icon actionIcon name="close" label="Remove row" onClick={onRemove} />
      ) : null}
    </>
  );
}

function EditButtons({
  onAccept,
  onCancel,
}: {
  onAccept: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <Button className={tableClassNames.okButton} onClick={onAccept}>
        OK
      </Button>
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </>
  );
}

function handleEditorKeyDown(
  event: React.KeyboardEvent<HTMLElement>,
  onAccept: () => void,
  onCancel: () => void,
) {
  if (event.key === 'Enter') {
    onAccept();
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (event.key === 'Escape') {
    onCancel();
    event.preventDefault();
    event.stopPropagation();
  }
}

function EditableComparisonTable({
  initialRows,
  addButtonLabel = 'Add Item',
  canAdd = true,
  initialEditingRowId = null,
}: {
  initialRows: ComparisonRowData[];
  addButtonLabel?: string;
  canAdd?: boolean;
  initialEditingRowId?: string | null;
}) {
  const initialEditingRow = initialRows.find(
    (row) => row.id === initialEditingRowId,
  );
  const [rows, setRows] = useState(initialRows);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(
    initialEditingRowId ?? initialRows[0]?.id ?? null,
  );
  const [editingRowId, setEditingRowId] = useState<string | null>(
    initialEditingRowId,
  );
  const [creatingRowId, setCreatingRowId] = useState<string | null>(
    initialEditingRow?.isNew ? initialEditingRowId : null,
  );
  const [draftKey, setDraftKey] = useState(initialEditingRow?.key ?? '');
  const [draftValue, setDraftValue] = useState(initialEditingRow?.value ?? '');

  const resetEditingState = () => {
    setEditingRowId(null);
    setCreatingRowId(null);
    setDraftKey('');
    setDraftValue('');
  };

  const startEdit = (rowId: string) => {
    const row = rows.find((item) => item.id === rowId);
    if (!row) {
      return;
    }

    setSelectedRowId(rowId);
    setEditingRowId(rowId);
    setCreatingRowId(row.isNew ? rowId : null);
    setDraftKey(row.key);
    setDraftValue(row.value);
  };

  const cancelEdit = () => {
    if (creatingRowId) {
      setRows((current) => current.filter((row) => row.id !== creatingRowId));
      setSelectedRowId((current) =>
        current === creatingRowId ? null : current,
      );
    }
    resetEditingState();
  };

  const commitEdit = () => {
    if (!editingRowId) {
      return;
    }

    setRows((current) =>
      current.map((row) =>
        row.id === editingRowId
          ? {
              ...row,
              key: draftKey,
              value: draftValue,
              isNew: false,
              invalid: draftKey.trim().length === 0,
            }
          : row,
      ),
    );
    resetEditingState();
  };

  const addRow = () => {
    const rowId = `new-${crypto.randomUUID()}`;
    const nextRow = {
      id: rowId,
      key: '',
      value: '',
      defaultValue: '',
      isNew: true,
      removable: true,
      resettable: false,
    } satisfies ComparisonRowData;

    setRows((current) => [...current, nextRow]);
    setSelectedRowId(rowId);
    setEditingRowId(rowId);
    setCreatingRowId(rowId);
    setDraftKey('');
    setDraftValue('');
  };

  const removeRow = (rowId: string) => {
    setRows((current) => current.filter((row) => row.id !== rowId));
    setSelectedRowId((current) =>
      resolveNextSelectedRowId(rows, rowId, current),
    );
    if (editingRowId === rowId) {
      cancelEdit();
    }
  };

  const resetRow = (rowId: string) => {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, value: row.defaultValue } : row,
      ),
    );
  };

  return (
    <Table
      ariaLabel="Setting comparison table"
      columns="minmax(0, 40%) minmax(0, 1fr) 92px"
      striped
      selectedRowId={selectedRowId}
      onSelectedRowChange={setSelectedRowId}
      onAddItem={canAdd ? addRow : undefined}
      addButtonLabel={addButtonLabel}
      hideAddButton={creatingRowId !== null}
    >
      <TableHeader>
        <TableHeaderCell kind="key">Item</TableHeaderCell>
        <TableHeaderCell>Value</TableHeaderCell>
        <TableHeaderCell kind="actions" aria-hidden="true" />
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const editing = row.id === editingRowId;

          return (
            <TableRow
              key={row.id}
              rowId={row.id}
              invalid={row.invalid}
              editing={editing}
              onAction={() => startEdit(row.id)}
            >
              <TableCell kind="key">
                {editing ? (
                  <div className={tableClassNames.editingKeyField}>
                    <TextInput
                      autoFocus
                      value={draftKey}
                      onChange={setDraftKey}
                      onKeyDown={(event) =>
                        handleEditorKeyDown(event, commitEdit, cancelEdit)
                      }
                      style={{ width: '100%', maxWidth: 'none' }}
                    />
                  </div>
                ) : (
                  row.key
                )}
              </TableCell>
              <TableCell>
                {editing ? (
                  <div className={tableClassNames.editingFieldFill}>
                    <TextInput
                      value={draftValue}
                      onChange={setDraftValue}
                      onKeyDown={(event) =>
                        handleEditorKeyDown(event, commitEdit, cancelEdit)
                      }
                      style={{ width: '100%', maxWidth: 'none' }}
                    />
                  </div>
                ) : (
                  row.value
                )}
              </TableCell>
              <TableCell kind="actions">
                {editing ? (
                  <EditButtons onAccept={commitEdit} onCancel={cancelEdit} />
                ) : (
                  <ActionButtons
                    onEdit={() => startEdit(row.id)}
                    onReset={
                      row.resettable ? () => resetRow(row.id) : undefined
                    }
                    onRemove={
                      row.removable ? () => removeRow(row.id) : undefined
                    }
                  />
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function EditableListTable({ initialRows }: { initialRows: ListRowData[] }) {
  const [rows, setRows] = useState(initialRows);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(
    initialRows[0]?.id ?? null,
  );
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [creatingRowId, setCreatingRowId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [draftSibling, setDraftSibling] = useState('');

  const resetEditingState = () => {
    setEditingRowId(null);
    setCreatingRowId(null);
    setDraftValue('');
    setDraftSibling('');
  };

  const startEdit = (rowId: string) => {
    const row = rows.find((item) => item.id === rowId);
    if (!row) {
      return;
    }

    setSelectedRowId(rowId);
    setEditingRowId(rowId);
    setCreatingRowId(row.isNew ? rowId : null);
    setDraftValue(row.value);
    setDraftSibling(row.sibling);
  };

  const cancelEdit = () => {
    if (creatingRowId) {
      setRows((current) => current.filter((row) => row.id !== creatingRowId));
      setSelectedRowId((current) =>
        current === creatingRowId ? null : current,
      );
    }
    resetEditingState();
  };

  const commitEdit = () => {
    if (!editingRowId) {
      return;
    }

    setRows((current) =>
      current.map((row) =>
        row.id === editingRowId
          ? {
              ...row,
              value: draftValue,
              sibling: draftSibling,
              isNew: false,
            }
          : row,
      ),
    );
    resetEditingState();
  };

  const addRow = () => {
    const rowId = `new-${crypto.randomUUID()}`;
    const nextRow = {
      id: rowId,
      value: '',
      sibling: '',
      isNew: true,
    } satisfies ListRowData;

    setRows((current) => [...current, nextRow]);
    setSelectedRowId(rowId);
    setEditingRowId(rowId);
    setCreatingRowId(rowId);
    setDraftValue('');
    setDraftSibling('');
  };

  const removeRow = (rowId: string) => {
    setRows((current) => current.filter((row) => row.id !== rowId));
    setSelectedRowId((current) =>
      resolveNextSelectedRowId(rows, rowId, current),
    );
    if (editingRowId === rowId) {
      cancelEdit();
    }
  };

  return (
    <Table
      ariaLabel="Files associations table"
      columns="minmax(0, 34%) minmax(0, 1fr) 172px"
      selectedRowId={selectedRowId}
      onSelectedRowChange={setSelectedRowId}
      onAddItem={addRow}
      addButtonLabel="Add Pattern"
      hideAddButton={creatingRowId !== null}
    >
      <TableBody>
        {rows.map((row) => {
          const editing = row.id === editingRowId;

          return (
            <TableRow
              key={row.id}
              rowId={row.id}
              editing={editing}
              onAction={() => startEdit(row.id)}
            >
              <TableCell>
                {editing ? (
                  <div className={tableClassNames.editingField}>
                    <TextInput
                      autoFocus
                      value={draftValue}
                      onChange={setDraftValue}
                      onKeyDown={(event) =>
                        handleEditorKeyDown(event, commitEdit, cancelEdit)
                      }
                      style={{ width: '100%', maxWidth: 'none' }}
                    />
                  </div>
                ) : (
                  row.value
                )}
              </TableCell>
              <TableCell tone={editing ? 'default' : 'muted'}>
                {editing ? (
                  <div className={tableClassNames.editingField}>
                    <TextInput
                      value={draftSibling}
                      onChange={setDraftSibling}
                      onKeyDown={(event) =>
                        handleEditorKeyDown(event, commitEdit, cancelEdit)
                      }
                      style={{ width: '100%', maxWidth: 'none' }}
                    />
                  </div>
                ) : row.sibling ? (
                  `when: ${row.sibling}`
                ) : null}
              </TableCell>
              <TableCell kind="actions">
                {editing ? (
                  <EditButtons onAccept={commitEdit} onCancel={cancelEdit} />
                ) : (
                  <ActionButtons
                    onEdit={() => startEdit(row.id)}
                    onRemove={() => removeRow(row.id)}
                  />
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export const ComparisonTable: Story = {
  args: { children: null },
  render: () => (
    <EditableComparisonTable
      initialRows={[
        {
          id: 'sound',
          key: 'sound',
          value: 'auto',
          defaultValue: 'off',
          resettable: true,
          removable: false,
        },
        {
          id: 'announcement',
          key: 'announcement',
          value: 'auto',
          defaultValue: 'off',
          resettable: true,
          removable: false,
        },
      ]}
      canAdd={false}
    />
  ),
};

export const ListStyleRows: Story = {
  args: { children: null },
  render: () => (
    <EditableListTable
      initialRows={[
        { id: 'pattern-1', value: '*.md', sibling: 'README.md' },
        {
          id: 'pattern-2',
          value: '*.code-workspace',
          sibling: 'workspace trust enabled',
        },
        { id: 'pattern-3', value: '*.prompt.md', sibling: 'chat mode active' },
      ]}
    />
  ),
};

export const InvalidKeyState: Story = {
  args: { children: null },
  render: () => (
    <EditableComparisonTable
      initialRows={[
        {
          id: 'valid-key',
          key: 'editor.fontSize',
          value: '14',
          defaultValue: '14',
          removable: true,
        },
        {
          id: 'invalid-key',
          key: 'editor font size',
          value: '14',
          defaultValue: '14',
          invalid: true,
          removable: true,
        },
      ]}
      canAdd={false}
      initialEditingRowId="invalid-key"
    />
  ),
};

export const InsideSettingItem: Story = {
  args: { children: null },
  render: () => (
    <FormContainer>
      <FormGroup
        label="Accessibility > Signals: Chat User Action Required"
        description="Plays a signal sound cue or announcement when chat requires user action."
        helper="Matches VS Code's object-style settings widget: Item/Value columns with edit and reset actions."
        fill
      >
        <EditableComparisonTable
          initialRows={[
            {
              id: 'sound',
              key: 'sound',
              value: 'auto',
              defaultValue: 'off',
              resettable: true,
              removable: false,
            },
            {
              id: 'announcement',
              key: 'announcement',
              value: 'auto',
              defaultValue: 'off',
              resettable: true,
              removable: false,
            },
          ]}
          canAdd={false}
        />
      </FormGroup>
    </FormContainer>
  ),
};
