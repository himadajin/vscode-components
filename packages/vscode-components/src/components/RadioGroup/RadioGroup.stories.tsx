import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio } from '../Radio';
import { RadioGroup } from './RadioGroup';

const meta = {
  title: 'Primitives/RadioGroup',
  component: RadioGroup,
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="user">User</Radio>
      <Radio value="workspace">Workspace</Radio>
      <Radio value="folder">Folder</Radio>
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('workspace');
    return (
      <RadioGroup {...args} value={value} onChange={setValue}>
        <Radio value="user">User</Radio>
        <Radio value="workspace">Workspace</Radio>
        <Radio value="folder">Folder</Radio>
      </RadioGroup>
    );
  },
};

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
};
