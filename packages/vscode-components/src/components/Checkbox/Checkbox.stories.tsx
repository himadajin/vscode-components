import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  args: {
    label: 'Enable feature',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Controlled: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true);
    return <Checkbox {...args} checked={checked} onChange={setChecked} />;
  },
};
