import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '../Checkbox';
import { Collapsible } from '../Collapsible';
import { Label } from '../Label';
import { ListEditor } from '../ListEditor';
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

export const WithLongLabelContent: Story = {
  args: {
    title:
      'Workbench: Settings Editor Subtitle Length Used To Verify Ellipsis And Wrapping Behavior',
    description:
      'Displays a long explanation so the description line can wrap naturally while the title remains visually aligned with VS Code settings rows.',
    category: 'Workbench > Settings Editor',
  },
};

export const NestedLabelDemo: Story = {
  args: {
    title: 'Accessibility: Accessible Form Labels',
    description:
      'Demonstrates the standalone Label component when you need an additional control-specific label inside a setting row.',
  },
  render: (args) => (
    <SettingItem
      {...args}
      children={
        <div
          style={{
            width: 'min(420px, 100%)',
            display: 'grid',
            gap: '9px',
          }}
        >
          <Label
            htmlFor="settings-label-demo"
            description="Clicked label text should focus the corresponding input."
          >
            Command Alias
          </Label>
          <TextInput
            id="settings-label-demo"
            defaultValue="workbench.action.showCommands"
          />
        </div>
      }
    />
  ),
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
