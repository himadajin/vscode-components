import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';

const basicUiIcons = [
  { icon: 'edit', label: 'Edit' },
  { icon: 'check', label: 'Confirm' },
  { icon: 'add', label: 'Add' },
  { icon: 'close', label: 'Close' },
  { icon: 'trash', label: 'Delete' },
  { icon: 'discard', label: 'Discard' },
  { icon: 'save', label: 'Save' },
  { icon: 'copy', label: 'Copy' },
  { icon: 'gear', label: 'Settings' },
  { icon: 'settings-gear', label: 'Configure' },
  { icon: 'lightbulb', label: 'Code Action' },
] as const;

const navigationAndDiscoveryIcons = [
  { icon: 'search', label: 'Search' },
  { icon: 'filter', label: 'Filter' },
  { icon: 'arrow-left', label: 'Back' },
  { icon: 'arrow-right', label: 'Next' },
  { icon: 'files', label: 'Files View' },
  { icon: 'folder', label: 'Open Folder' },
  { icon: 'chevron-right', label: 'Expand' },
] as const;

const commandsAndExecutionIcons = [
  { icon: 'play', label: 'Run Command' },
  { icon: 'run-all', label: 'Run All' },
  { icon: 'debug-start', label: 'Debug' },
  { icon: 'refresh', label: 'Refresh' },
  { icon: 'sync', label: 'Sync' },
  { icon: 'terminal', label: 'Terminal' },
] as const;

const statusAndFeedbackIcons = [
  { icon: 'warning', label: 'Warning' },
  { icon: 'error', label: 'Error' },
  { icon: 'bell', label: 'Notification' },
  { icon: '$(loading~spin)', label: 'Loading' },
] as const;

const extensionAndProjectIcons = [
  { icon: 'extensions', label: 'Extensions' },
  { icon: 'repo', label: 'Repository' },
  { icon: 'github', label: 'GitHub' },
  { icon: 'book', label: 'Documentation' },
  { icon: 'file-code', label: 'Source File' },
  { icon: 'symbol-function', label: 'Function' },
] as const;

const meta = {
  title: 'Primitives/Icon',
  component: Icon,
  args: {
    name: 'settings-gear',
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

function IconGrid({
  items,
}: {
  items: ReadonlyArray<{ icon: string; label: string }>;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 240px))',
        justifyContent: 'center',
        gap: 10,
        width: 'min(100%, 520px)',
        margin: '0 auto',
      }}
    >
      {items.map((item) => (
        <div
          key={`${item.icon}-${item.label}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            minHeight: 36,
            padding: '6px 8px',
            border: '1px solid var(--vscode-panel-border)',
            borderRadius: 4,
            background: 'var(--vscode-editor-background)',
          }}
        >
          <Icon icon={item.icon} />
          <code style={{ fontSize: 11 }}>{item.label}</code>
        </div>
      ))}
    </div>
  );
}

export const BasicUi: Story = {
  render: () => <IconGrid items={basicUiIcons} />,
};

export const NavigationAndDiscovery: Story = {
  render: () => <IconGrid items={navigationAndDiscoveryIcons} />,
};

export const CommandsAndExecution: Story = {
  render: () => <IconGrid items={commandsAndExecutionIcons} />,
};

export const StatusAndFeedback: Story = {
  render: () => <IconGrid items={statusAndFeedbackIcons} />,
};

export const ExtensionAndProject: Story = {
  render: () => <IconGrid items={extensionAndProjectIcons} />,
};
