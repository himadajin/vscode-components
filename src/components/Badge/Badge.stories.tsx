import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  args: {
    children: 'Preview',
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Counter: Story = { args: { variant: 'counter', children: '12' } };
export const ActivityBarCounter: Story = {
  args: { variant: 'activity-bar-counter', children: '5' },
};
