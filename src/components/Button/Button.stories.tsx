import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  args: {
    children: 'Save',
    variant: 'primary',
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Cancel' },
};
export const Disabled: Story = { args: { disabled: true } };
