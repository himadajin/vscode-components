import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormHelper } from '../FormHelper';
import { TextInput } from '../TextInput';
import { FormGroup } from './FormGroup';

const meta = {
  title: 'Form/FormGroup',
  component: FormGroup,
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
  args: {
    label: 'Editor: Font Size',
    description: 'Controls the font size in pixels.',
    children: <TextInput defaultValue={14} type="number" />,
  },
} satisfies Meta<typeof FormGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelper: Story = {
  args: {
    helper: 'Minimum value is 6. Restart not required.',
  },
};

export const WithValidation: Story = {
  render: (args) => {
    const [value, setValue] = useState('200');
    const invalid = Number(value) > 100 || Number(value) < 6;

    return (
      <FormGroup
        {...args}
        helper={
          invalid ? (
            <FormHelper tone="error">
              The value must be an integer between 6 and 100.
            </FormHelper>
          ) : (
            'Minimum value is 6.'
          )
        }
      >
        <TextInput type="number" value={value} onChange={setValue} />
      </FormGroup>
    );
  },
};
