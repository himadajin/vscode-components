import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Textarea } from './Textarea';

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  args: {
    placeholder: 'Enter multi-line text',
    defaultValue: 'First line\nSecond line',
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState(
      'System prompt:\nYou are a careful reviewer.',
    );
    return <Textarea {...args} value={value} onChange={setValue} />;
  },
};

export const JsonFragment: Story = {
  args: {
    monospace: true,
    defaultValue: '{\n  "name": "Textarea",\n  "multiline": true\n}',
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    defaultValue: '',
    placeholder: 'Validation failed',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Disabled value',
  },
};
