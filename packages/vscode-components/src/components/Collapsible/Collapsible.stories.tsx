import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { TextInput } from '../TextInput';
import { Collapsible } from './Collapsible';

const meta = {
  title: 'Layout/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
  decorators: [
    (Story) => (
      <div className="storybook-vscode-settings-shell">
        <div className="storybook-vscode-settings-row">
          <Story />
        </div>
      </div>
    ),
  ],
  args: {
    title: 'Files Explorer',
    description: '3 changes',
    defaultOpen: true,
    children: (
      <div style={{ padding: '10px 8px 12px 22px' }}>
        <div>src</div>
        <div>package.json</div>
        <div>README.md</div>
      </div>
    ),
  },
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ClosedByDefault: Story = {
  args: {
    defaultOpen: false,
  },
};

export const WithDecorationsAndActions: Story = {
  args: {
    decorations: <Badge variant="counter">3</Badge>,
    actions: <Button variant="secondary">Refresh</Button>,
  },
};

export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);

    return (
      <Collapsible {...args} open={open} onOpenChange={setOpen}>
        <div style={{ padding: '10px 8px 12px 22px' }}>
          Controlled state: {open ? 'open' : 'closed'}
        </div>
      </Collapsible>
    );
  },
};

export const InsideFormGroup: Story = {
  render: () => (
    <FormContainer>
      <FormGroup
        label="Workbench: Startup Editor"
        description="Controls which editor is shown at startup."
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
    </FormContainer>
  ),
};
