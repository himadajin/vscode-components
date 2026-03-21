import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ToolbarContainer } from '../ToolbarContainer';
import { ToolbarButton } from './ToolbarButton';

const meta = {
  title: 'Primitives/ToolbarButton',
  component: ToolbarButton,
  args: {
    icon: 'refresh',
    label: 'Refresh',
  },
} satisfies Meta<typeof ToolbarButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <ToolbarContainer ariaLabel="Toolbar button demo">
      <ToolbarButton {...args} />
    </ToolbarContainer>
  ),
};

export const Toggleable: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true);

    return (
      <ToolbarContainer ariaLabel="Toggle toolbar button demo">
        <ToolbarButton
          {...args}
          icon="pinned"
          label="Pin"
          toggleable
          checked={checked}
          onClick={() => setChecked((current) => !current)}
        />
      </ToolbarContainer>
    );
  },
};

export const IconOnly: Story = {
  render: () => (
    <ToolbarContainer ariaLabel="Icon toolbar button demo">
      <ToolbarButton icon="refresh" label="Refresh" />
      <ToolbarButton icon="sync" label="Sync" />
      <ToolbarButton icon="gear" label="Configure" />
    </ToolbarContainer>
  ),
};
