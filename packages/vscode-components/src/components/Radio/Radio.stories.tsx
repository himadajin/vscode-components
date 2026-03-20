import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio } from './Radio';

const meta = {
  title: 'Primitives/Radio',
  component: Radio,
  args: {
    label: 'Use workspace value',
    value: 'workspace',
  },
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(true);
    return (
      <Radio
        {...args}
        checked={checked}
        onChange={(nextChecked) => setChecked(nextChecked)}
      />
    );
  },
};
