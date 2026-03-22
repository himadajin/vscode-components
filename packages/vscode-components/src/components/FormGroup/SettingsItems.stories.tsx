import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '../Checkbox';
import { Collapsible } from '../Collapsible';
import { Divider } from '../Divider';
import { FormContainer } from '../FormContainer';
import { FormHelper } from '../FormHelper';
import { Label } from '../Label';
import { ListEditor } from '../ListEditor';
import { MultiSelect } from '../MultiSelect';
import { ProgressRing } from '../ProgressRing';
import { Radio } from '../Radio';
import { RadioGroup } from '../RadioGroup';
import { Select } from '../Select';
import { SplitLayout } from '../SplitLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '../Table';
import { ToolbarButton } from '../ToolbarButton';
import { ToolbarContainer } from '../ToolbarContainer';
import { TabHeader } from '../TabHeader';
import { TabPanel } from '../TabPanel';
import { Textarea } from '../Textarea';
import { TextInput } from '../TextInput';
import { Tabs } from '../Tabs';
import { FormGroup } from './FormGroup';

const meta = {
  title: 'Form/Settings Items',
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
  decorators: [
    (Story) => (
      <FormContainer>
        <Story />
      </FormContainer>
    ),
  ],
} satisfies Meta<typeof FormGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCategory: Story = {
  args: {
    category: 'Editor > Font',
    fill: true,
  },
};

export const Modified: Story = {
  args: {
    modified: true,
  },
};

export const WithCheckbox: Story = {
  args: {
    label: 'Files: Auto Save',
    children: <Checkbox label="Enabled" defaultChecked />,
  },
};

export const WithSelect: Story = {
  args: {
    label: 'Workbench: Color Theme',
    children: <Select enum={['Default Dark+', 'Light+', 'High Contrast']} />,
    fill: true,
  },
};

export const WithMultiSelect: Story = {
  args: {
    label: 'Files: Readonly Include',
    description: 'Choose the languages that inherit readonly mode.',
    fill: true,
  },
  render: (args) => {
    const [value, setValue] = useState(['typescript', 'json']);

    return (
      <FormGroup {...args}>
        <MultiSelect
          fill
          enum={['typescript', 'javascript', 'json', 'markdown']}
          enumItemLabels={['TypeScript', 'JavaScript', 'JSON', 'Markdown']}
          value={value}
          onChange={setValue}
        />
      </FormGroup>
    );
  },
};

export const WithToolbarActions: Story = {
  args: {
    label: 'Chat: Inline Actions',
    description:
      'Shows compact row actions aligned like VS Code command surfaces.',
  },
  render: (args) => (
    <FormGroup {...args}>
      <ToolbarContainer ariaLabel="Inline actions">
        <ToolbarButton icon="refresh" label="Refresh" />
        <ToolbarButton icon="sparkle" label="Generate" />
        <ToolbarButton icon="gear" label="Configure" />
      </ToolbarContainer>
    </FormGroup>
  ),
};

export const WithProgressRing: Story = {
  args: {
    label: 'Extensions: Verify Recommendations',
    description: 'Displays lightweight background work within a setting row.',
    fill: true,
  },
  render: (args) => (
    <FormGroup {...args}>
      <div style={{ width: '100%', maxWidth: 420, paddingTop: 9 }}>
        <ProgressRing ariaLabel="Verifying recommendations" />
      </div>
    </FormGroup>
  ),
};

export const WithRadioGroup: Story = {
  args: {
    label: 'Workbench: Preferred Settings Target',
    description:
      'Controls where a changed setting is written when multiple scopes are available.',
  },
  render: (args) => {
    const [value, setValue] = useState('workspace');

    return (
      <FormGroup {...args}>
        <RadioGroup orientation="vertical" value={value} onChange={setValue}>
          <Radio value="user">User</Radio>
          <Radio value="workspace">Workspace</Radio>
          <Radio value="folder">Folder</Radio>
        </RadioGroup>
      </FormGroup>
    );
  },
};

export const WithTextarea: Story = {
  args: {
    label: 'Chat: System Prompt',
    description: 'Defines the base instruction used for prompt-driven actions.',
    children: (
      <Textarea
        rows={4}
        defaultValue={'You are a careful assistant.\nReturn concise answers.'}
        monospace
      />
    ),
    fill: true,
  },
};

export const WithListEditor: Story = {
  args: {
    label: 'Files: Associations',
  },
  render: (args) => {
    const [value, setValue] = useState(['*.md', '*.txt']);

    return (
      <FormGroup {...args} fill>
        <ListEditor value={value} onChange={setValue} />
      </FormGroup>
    );
  },
};

export const WithLongLabelContent: Story = {
  args: {
    label:
      'Workbench: Settings Editor Subtitle Length Used To Verify Ellipsis And Wrapping Behavior',
    description:
      'Displays a long explanation so the description line can wrap naturally while the title remains visually aligned with VS Code settings rows.',
    category: 'Workbench > Settings Editor',
  },
};

export const NestedLabelDemo: Story = {
  args: {
    label: 'Accessibility: Accessible Form Labels',
    description:
      'Demonstrates the standalone Label component when you need an additional control-specific label inside a setting row.',
  },
  render: (args) => (
    <FormGroup {...args} fill>
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
    </FormGroup>
  ),
};

export const WithTable: Story = {
  args: {
    label: 'Accessibility > Signals: Chat User Action Required',
    description:
      'Shows the VS Code object-style settings table pattern with Item/Value columns and reset actions.',
    fill: true,
  },
  render: (args) => (
    <FormGroup {...args}>
      <Table
        ariaLabel="Accessibility signal table"
        columns="minmax(0, 40%) minmax(0, 1fr) 92px"
        striped
        defaultSelectedRowId="sound"
      >
        <TableHeader>
          <TableHeaderCell kind="key">Item</TableHeaderCell>
          <TableHeaderCell>Value</TableHeaderCell>
          <TableHeaderCell kind="actions" aria-hidden="true" />
        </TableHeader>
        <TableBody>
          <TableRow rowId="sound">
            <TableCell kind="key">sound</TableCell>
            <TableCell>auto</TableCell>
            <TableCell kind="actions" />
          </TableRow>
          <TableRow rowId="announcement">
            <TableCell kind="key">announcement</TableCell>
            <TableCell>auto</TableCell>
            <TableCell kind="actions" />
          </TableRow>
        </TableBody>
      </Table>
    </FormGroup>
  ),
};

export const WithCollapsible: Story = {
  args: {
    label: 'Workbench: Startup Editor',
    description: 'Controls which editor is shown at startup.',
  },
  render: (args) => (
    <FormGroup
      {...args}
      helper="Expand advanced rules to configure workspace-specific fallbacks."
      fill
    >
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
    </FormGroup>
  ),
};

export const WithFormLayout: Story = {
  args: {
    label: 'Editor: Inline Suggestions',
    description: 'Embed a compact grouped form inside a setting row.',
  },
  render: (args) => {
    const [delay, setDelay] = useState('150');
    const [showToolbar, setShowToolbar] = useState(true);
    const invalid = Number(delay) < 0;

    return (
      <FormGroup {...args} fill>
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
      </FormGroup>
    );
  },
};

export const WithTabs: Story = {
  args: {
    label: 'Workbench: Settings Sections',
    description:
      'Switch between related settings panels inside a single settings row.',
  },
  render: (args) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
      <FormGroup {...args} fill>
        <Tabs selectedIndex={selectedIndex} onSelect={setSelectedIndex}>
          <TabHeader>General</TabHeader>
          <TabHeader>Search</TabHeader>
          <TabHeader>Advanced</TabHeader>
          <TabPanel>
            <div style={{ padding: '12px 0 0' }}>
              <TextInput defaultValue="files.exclude" />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{ padding: '12px 0 0' }}>
              <TextInput defaultValue="search.exclude" />
            </div>
          </TabPanel>
          <TabPanel>
            <div style={{ padding: '12px 0 0' }}>
              <Textarea
                rows={3}
                defaultValue="editor.experimental.asyncTokenization"
              />
            </div>
          </TabPanel>
        </Tabs>
      </FormGroup>
    );
  },
};

export const WithSplitLayout: Story = {
  args: {
    label: 'Workbench: Pane Layout',
    description:
      'Demonstrates a split view embedded in a setting row for layout-oriented preferences.',
  },
  render: (args) => (
    <FormGroup {...args} fill>
      <div style={{ height: 120 }}>
        <SplitLayout
          split="vertical"
          initialHandlePosition="42%"
          start={
            <div style={{ height: '100%', padding: '10px 12px' }}>Sidebar</div>
          }
          end={
            <div style={{ height: '100%', padding: '10px 12px' }}>Editor</div>
          }
        />
      </div>
    </FormGroup>
  ),
};

export const WithDividerBetweenGroups: Story = {
  args: {
    label: 'Search: Quick Open History Filter',
  },
  render: (args) => (
    <FormGroup
      {...args}
      description="Separates primary and secondary actions inside the same setting row."
      fill
    >
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
    </FormGroup>
  ),
};
