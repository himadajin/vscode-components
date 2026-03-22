import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Badge } from '../Badge';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { ToolbarButton } from '../ToolbarButton';
import { Tree, type TreeItem } from './Tree';

const explorerItems: TreeItem[] = [
  {
    id: 'src',
    label: 'src',
    icon: 'folder',
    children: [
      {
        id: 'components',
        label: 'components',
        icon: 'folder',
        children: [
          { id: 'tree-tsx', label: 'Tree.tsx', icon: 'symbol-class' },
          { id: 'tree-css', label: 'Tree.module.css', icon: 'symbol-color' },
          { id: 'tree-story', label: 'Tree.stories.tsx', icon: 'book' },
        ],
      },
      { id: 'index-ts', label: 'index.ts', icon: 'symbol-file' },
    ],
  },
  {
    id: 'package-json',
    label: 'package.json',
    icon: 'json',
    value: 'modified',
  },
  {
    id: 'readme',
    label: 'README.md',
    icon: 'markdown',
    badge: '1',
  },
];

const settingsItems: TreeItem[] = [
  {
    id: 'most-used',
    label: 'Most Commonly Used',
    icon: 'star-full',
  },
  {
    id: 'text-editor',
    label: 'Text Editor',
    icon: 'edit',
    children: [
      { id: 'editor-font', label: 'Font', icon: 'symbol-number' },
      { id: 'editor-cursor', label: 'Cursor', icon: 'symbol-key' },
      { id: 'editor-diff', label: 'Diff Editor', icon: 'diff' },
    ],
  },
  {
    id: 'workbench',
    label: 'Workbench',
    icon: 'window',
    children: [
      { id: 'appearance', label: 'Appearance', icon: 'symbol-color' },
      { id: 'editor-management', label: 'Editor Management', icon: 'files' },
      { id: 'startup', label: 'Startup', icon: 'rocket' },
    ],
  },
  {
    id: 'features',
    label: 'Features',
    icon: 'extensions',
    children: [
      { id: 'explorer', label: 'Explorer', icon: 'files' },
      { id: 'search', label: 'Search', icon: 'search' },
      { id: 'chat', label: 'Chat', icon: 'comment-discussion' },
    ],
  },
];

const meta = {
  title: 'Navigation/Tree',
  component: Tree,
  parameters: {
    layout: 'padded',
  },
  args: {
    ariaLabel: 'Explorer tree',
    items: explorerItems,
    defaultExpandedIds: ['src', 'components'],
    defaultSelectedIds: ['tree-tsx'],
    defaultFocusedId: 'tree-tsx',
    renderIndentGuides: 'onHover',
    style: {
      width: 320,
      height: 240,
      border: '1px solid var(--vscode-panel-border)',
    },
  },
} satisfies Meta<typeof Tree>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Explorer: Story = {};

export const Empty: Story = {
  args: {
    ariaLabel: 'Empty tree',
    items: [],
    emptyState: 'No settings found.',
  },
};

export const SettingsCategories: Story = {
  args: {
    ariaLabel: 'Settings categories',
    items: settingsItems,
    defaultExpandedIds: ['text-editor', 'workbench', 'features'],
    defaultSelectedIds: ['chat'],
    defaultFocusedId: 'chat',
    style: {
      width: 320,
      height: 300,
      border: '1px solid var(--vscode-panel-border)',
    },
  },
};

export const InsideSettingItem: Story = {
  args: {
    ariaLabel: 'Settings navigation tree',
    items: settingsItems,
    defaultExpandedIds: ['text-editor', 'workbench'],
    defaultSelectedIds: ['editor-font'],
    defaultFocusedId: 'editor-font',
    style: undefined,
  },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState(['editor-font']);

    return (
      <FormContainer>
        <FormGroup
          label="Workbench: Settings Navigation"
          description="Embeds a VS Code style tree inside a setting row to preview category navigation."
          fill
        >
          <div style={{ width: 'min(100%, 360px)' }}>
            <Tree
              {...args}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
              renderIndentGuides="always"
              renderItem={(item, state) => (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.label}
                    </span>
                    {state.selected ? <Badge>Active</Badge> : null}
                  </div>
                  {item.children?.length ? (
                    <span
                      style={{ color: 'var(--vscode-descriptionForeground)' }}
                    >
                      {item.children.length}
                    </span>
                  ) : null}
                </>
              )}
              style={{
                width: '100%',
                height: 220,
                border: '1px solid var(--vscode-panel-border)',
              }}
            />
          </div>
        </FormGroup>
      </FormContainer>
    );
  },
};

export const WithInlineActions: Story = {
  args: {
    ariaLabel: 'Outline tree',
    items: [
      {
        id: 'outline-component',
        label: 'Tree',
        icon: 'symbol-class',
        actions: (
          <>
            <ToolbarButton icon="add" label="Add child" />
            <ToolbarButton icon="refresh" label="Refresh" />
          </>
        ),
        children: [
          {
            id: 'outline-props',
            label: 'Props',
            icon: 'symbol-structure',
            badge: '12',
          },
          {
            id: 'outline-events',
            label: 'Events',
            icon: 'symbol-event',
          },
        ],
      },
    ],
    defaultExpandedIds: ['outline-component'],
    defaultFocusedId: 'outline-props',
    defaultSelectedIds: ['outline-props'],
    style: {
      width: 360,
      height: 180,
      border: '1px solid var(--vscode-panel-border)',
    },
  },
};
