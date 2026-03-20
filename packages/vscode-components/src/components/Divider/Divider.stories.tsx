import type { Meta, StoryObj } from '@storybook/react';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { Divider } from './Divider';

const meta = {
  title: 'Layout/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
    vscodePreview: 'settings',
  },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <div>General</div>
      <Divider />
      <div>Advanced</div>
    </div>
  ),
};

export const InSettingsLayout: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <FormContainer>
      <FormGroup
        label="Workbench: Startup Editor"
        description="Controls which editor is shown at startup."
      >
        <div>readme</div>
      </FormGroup>
      <Divider />
      <FormGroup
        label="Workbench: Tree Indent"
        description="Controls tree indentation in pixels."
      >
        <div>8</div>
      </FormGroup>
    </FormContainer>
  ),
};
