import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { FormHelper } from '../FormHelper';
import { MultiSelect } from './MultiSelect';

const meta = {
  title: 'Primitives/MultiSelect',
  component: MultiSelect,
  args: {
    enum: ['typescript', 'javascript', 'json', 'markdown'],
    enumItemLabels: ['TypeScript', 'JavaScript', 'JSON', 'Markdown'],
    defaultValue: ['typescript', 'json'],
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState(['typescript', 'json']);
    return <MultiSelect {...args} value={value} onChange={setValue} />;
  },
};

export const Invalid: Story = {
  render: (args) => (
    <FormContainer>
      <FormGroup
        label="Files: Readonly Include"
        description="Select at least one language override to continue."
        helper={
          <FormHelper tone="error">
            Select one or more values before saving.
          </FormHelper>
        }
        fill
      >
        <MultiSelect {...args} invalid required fill defaultValue={[]} />
      </FormGroup>
    </FormContainer>
  ),
};
