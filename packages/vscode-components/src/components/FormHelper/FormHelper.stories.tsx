import type { Meta, StoryObj } from '@storybook/react';
import { FormHelper } from './FormHelper';

const meta = {
  title: 'Form/FormHelper',
  component: FormHelper,
  args: {
    children: 'Controls the font size in pixels.',
  },
} satisfies Meta<typeof FormHelper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Description: Story = {};

export const Info: Story = {
  args: {
    tone: 'info',
    children: 'Only applied after you reopen the editor.',
  },
};

export const Warning: Story = {
  args: {
    tone: 'warning',
    children: 'A window reload is required for this setting.',
  },
};

export const Error: Story = {
  args: {
    tone: 'error',
    children: 'The value must be an integer between 6 and 100.',
  },
};
