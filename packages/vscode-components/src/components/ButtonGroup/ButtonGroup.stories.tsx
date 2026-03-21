import type { Meta, StoryObj } from '@storybook/react';
import { ToolbarButton } from '../ToolbarButton';
import { ButtonGroup } from './ButtonGroup';

const meta = {
  title: 'Primitives/ButtonGroup',
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ButtonGroup ariaLabel="Button group demo">
      <ToolbarButton icon="chevron-left" label="Previous" />
      <ToolbarButton icon="play" label="Run" />
      <ToolbarButton icon="chevron-right" label="Next" />
    </ButtonGroup>
  ),
};
