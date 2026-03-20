import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select } from './Select';

const meta = {
  title: 'Primitives/Select',
  component: Select,
  args: {
    enum: ['off', 'on', 'auto'],
    enumDescriptions: ['Disabled', 'Enabled', 'Automatic'],
    defaultValue: 'auto',
  },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLabels: Story = {
  args: {
    enum: ['left', 'center', 'right'],
    enumItemLabels: ['Left Align', 'Center Align', 'Right Align'],
  },
};
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('auto');
    return <Select {...args} value={value} onChange={setValue} />;
  },
};
