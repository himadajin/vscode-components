import type { Meta, StoryObj } from '@storybook/react';
import { ToolbarButton } from '../ToolbarButton';
import { ToolbarContainer } from './ToolbarContainer';

const meta = {
  title: 'Primitives/ToolbarContainer',
  component: ToolbarContainer,
} satisfies Meta<typeof ToolbarContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ToolbarContainer ariaLabel="Toolbar container demo">
      <ToolbarButton icon="refresh" label="Refresh" />
      <ToolbarButton icon="sync" label="Sync" />
      <ToolbarButton icon="gear" label="Configure" />
    </ToolbarContainer>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ToolbarContainer ariaLabel="Vertical toolbar demo" orientation="vertical">
      <ToolbarButton icon="new-file" label="New File" />
      <ToolbarButton icon="new-folder" label="New Folder" />
      <ToolbarButton icon="refresh" label="Refresh" />
    </ToolbarContainer>
  ),
};
