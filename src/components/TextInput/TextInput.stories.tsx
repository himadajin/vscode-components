import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TextInput } from './TextInput';

const meta = {
  title: 'Primitives/TextInput',
  component: TextInput,
  args: {
    placeholder: 'Enter value',
    defaultValue: 'Preview',
  },
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Number: Story = { args: { type: 'number', defaultValue: 12 } };
export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('Controlled value');
    return <TextInput {...args} value={value} onChange={setValue} />;
  },
};
