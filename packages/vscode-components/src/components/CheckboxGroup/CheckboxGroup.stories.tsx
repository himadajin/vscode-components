import type { Meta, StoryObj } from '@storybook/react';
import { useMemo, useState } from 'react';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { CheckboxGroup } from './CheckboxGroup';

const items = [
  { key: 'typescript', label: 'TypeScript' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'json', label: 'JSON' },
  { key: 'markdown', label: 'Markdown' },
];

const meta = {
  title: 'Form/CheckboxGroup',
  component: CheckboxGroup,
  args: {
    items,
    defaultValue: {
      typescript: true,
      javascript: false,
      json: true,
      markdown: false,
    },
  },
} satisfies Meta<typeof CheckboxGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: 'No scopes are available.',
  },
};

export const ValidationError: Story = {
  render: (args) => {
    const [value, setValue] = useState<Record<string, boolean>>({
      typescript: false,
      javascript: false,
      json: false,
      markdown: false,
    });
    const invalid = useMemo(
      () => Object.values(value).every((checked) => !checked),
      [value],
    );

    return (
      <CheckboxGroup
        {...args}
        value={value}
        invalid={invalid}
        validationMessage="Select at least one language."
        onChange={setValue}
      />
    );
  },
};

export const SettingsItemDemo: Story = {
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
  render: (args) => {
    const [value, setValue] = useState<Record<string, boolean>>({
      typescript: true,
      javascript: false,
      json: true,
      markdown: false,
    });

    return (
      <FormContainer>
        <FormGroup
          label="Files: Readonly Include"
          description="Controls the languages that remain readonly in filtered views."
          fill
        >
          <CheckboxGroup {...args} value={value} onChange={setValue} />
        </FormGroup>
      </FormContainer>
    );
  },
};
