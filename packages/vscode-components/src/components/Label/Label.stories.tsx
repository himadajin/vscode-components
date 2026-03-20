import type { Meta, StoryObj } from '@storybook/react';
import { useId } from 'react';
import { TextInput } from '../TextInput';
import { Label } from './Label';

const meta = {
  title: 'Forms/Label',
  component: Label,
  parameters: {
    layout: 'padded',
    vscodePreview: 'settings',
  },
  args: {
    children: 'Editor: Font Size',
    description: 'Controls the font size in pixels.',
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCategory: Story = {
  args: {
    category: 'Editor > Font',
  },
};

export const ForTextInput: Story = {
  render: (args) => {
    const inputId = useId();

    return (
      <div style={{ width: 'min(420px, 100%)' }}>
        <Label {...args} htmlFor={inputId} />
        <div style={{ marginTop: 9 }}>
          <TextInput id={inputId} defaultValue={14} type="number" />
        </div>
      </div>
    );
  },
};

export const LongCopy: Story = {
  args: {
    category: 'Workbench > Settings Editor',
    children:
      'Workbench: Settings Editor Subtitle Length Used To Verify Ellipsis And Wrapping Behavior',
    description:
      'Displays a long explanation so the description line can wrap naturally without breaking the title metrics used by the settings editor row layout.',
  },
};
