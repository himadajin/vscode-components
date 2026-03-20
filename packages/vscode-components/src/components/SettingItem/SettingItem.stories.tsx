import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '../Checkbox';
import { Collapsible } from '../Collapsible';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { FormHelper } from '../FormHelper';
import { Divider } from '../Divider';
import { ListEditor } from '../ListEditor';
import { Radio } from '../Radio';
import { RadioGroup } from '../RadioGroup';
import { Select } from '../Select';
import { Textarea } from '../Textarea';
import { TextInput } from '../TextInput';
import { SettingItem } from './SettingItem';

const meta = {
  title: 'Layout/SettingItem',
  component: SettingItem,
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
  args: {
    title: 'Editor: Font Size',
    description: 'Controls the font size in pixels.',
    children: <TextInput defaultValue={14} type="number" />,
  },
} satisfies Meta<typeof SettingItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithCategory: Story = { args: { category: 'Editor > Font' } };
export const Modified: Story = { args: { modified: true } };
export const WithCheckbox: Story = {
  args: {
    title: 'Files: Auto Save',
    children: <Checkbox label="Enabled" defaultChecked />,
  },
};
export const WithSelect: Story = {
  args: {
    title: 'Workbench: Color Theme',
    children: <Select enum={['Default Dark+', 'Light+', 'High Contrast']} />,
  },
};
export const WithRadioGroup: Story = {
  args: {
    title: 'Workbench: Preferred Settings Target',
    description:
      'Controls where a changed setting is written when multiple scopes are available.',
  },
  render: (args) => {
    const [value, setValue] = useState('workspace');
    return (
      <SettingItem
        {...args}
        children={
          <RadioGroup orientation="vertical" value={value} onChange={setValue}>
            <Radio value="user">User</Radio>
            <Radio value="workspace">Workspace</Radio>
            <Radio value="folder">Folder</Radio>
          </RadioGroup>
        }
      />
    );
  },
};
export const WithTextarea: Story = {
  args: {
    title: 'Chat: System Prompt',
    description: 'Defines the base instruction used for prompt-driven actions.',
    children: (
      <Textarea
        rows={4}
        defaultValue={'You are a careful assistant.\nReturn concise answers.'}
        monospace
      />
    ),
  },
};
export const WithListEditor: Story = {
  args: {
    title: 'Files: Associations',
  },
  render: (args) => {
    const [value, setValue] = useState(['*.md', '*.txt']);
    return (
      <SettingItem
        {...args}
        children={<ListEditor value={value} onChange={setValue} />}
      />
    );
  },
};

export const WithCollapsible: Story = {
  args: {
    title: 'Workbench: Startup Editor',
    description: 'Controls which editor is shown at startup.',
    className: 'setting-item setting-item-list',
  },
  render: (args) => (
    <SettingItem
      {...args}
      children={
        <Collapsible
          title="Advanced startup rules"
          description="workspace overrides"
          defaultOpen
        >
          <div
            style={{
              width: '100%',
              padding: '10px 8px 12px 22px',
              display: 'grid',
              gap: '8px',
            }}
          >
            <TextInput
              defaultValue="readme"
              style={{ width: '100%', maxWidth: 'none' }}
            />
            <TextInput
              defaultValue="welcomePage"
              style={{ width: '100%', maxWidth: 'none' }}
            />
          </div>
        </Collapsible>
      }
    />
  ),
};

export const WithFormLayout: Story = {
  args: {
    title: 'Editor: Inline Suggestions',
    description: 'Embed a compact grouped form inside a setting row.',
    className: 'setting-item setting-item-list',
  },
  render: (args) => {
    const [delay, setDelay] = useState('150');
    const [showToolbar, setShowToolbar] = useState(true);
    const invalid = Number(delay) < 0;

    return (
      <SettingItem
        {...args}
        children={
          <FormContainer style={{ width: '100%' }}>
            <FormGroup
              label="Editor: Inline Suggest Delay"
              description="Controls the delay in milliseconds."
              helper={
                invalid ? (
                  <FormHelper tone="error">
                    The value must be 0 or greater.
                  </FormHelper>
                ) : (
                  'Use 0 to show suggestions immediately.'
                )
              }
              fill
            >
              <TextInput type="number" value={delay} onChange={setDelay} />
            </FormGroup>
            <FormGroup
              label="Editor: Inline Suggest Toolbar"
              description="Controls whether the inline suggestion toolbar is shown."
              modified={showToolbar}
            >
              <Checkbox
                toggle
                checked={showToolbar}
                onChange={setShowToolbar}
                label={showToolbar ? 'Enabled' : 'Disabled'}
              />
            </FormGroup>
          </FormContainer>
        }
      />
    );
  },
};

export const WithDividerBetweenGroups: Story = {
  args: {
    title: 'Search: Quick Open History Filter',
  },
  render: (args) => (
    <SettingItem
      {...args}
      description="Separates primary and secondary actions inside the same setting row."
      children={
        <div style={{ width: '100%', maxWidth: 320 }}>
          <TextInput
            defaultValue="default"
            style={{ width: '100%', maxWidth: 'none' }}
          />
          <Divider />
          <TextInput
            defaultValue="files.exclude"
            style={{ width: '100%', maxWidth: 'none' }}
          />
        </div>
      }
    />
  ),
};
