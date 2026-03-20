import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { SplitLayout } from './SplitLayout';

const meta = {
  title: 'Layout/SplitLayout',
  component: SplitLayout,
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
  args: {
    split: 'vertical',
    initialHandlePosition: '40%',
  },
} satisfies Meta<typeof SplitLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [position, setPosition] = useState('40%');

    return (
      <div style={{ height: 280 }}>
        <SplitLayout
          {...args}
          handlePosition={position}
          onChange={({ positionInPercentage }) =>
            setPosition(`${positionInPercentage}%`)
          }
          start={
            <div style={{ height: '100%', padding: '12px' }}>
              Explorer-like primary pane.
            </div>
          }
          end={
            <div style={{ height: '100%', padding: '12px' }}>
              Details or preview pane.
            </div>
          }
        />
      </div>
    );
  },
};

export const Horizontal: Story = {
  args: {
    split: 'horizontal',
    initialHandlePosition: '50%',
  },
  render: (args) => (
    <div style={{ height: 280 }}>
      <SplitLayout
        {...args}
        start={<div style={{ height: '100%', padding: '12px' }}>Top pane.</div>}
        end={
          <div style={{ height: '100%', padding: '12px' }}>Bottom pane.</div>
        }
      />
    </div>
  ),
};

export const InSettingItem: Story = {
  render: () => (
    <FormContainer>
      <FormGroup
        label="Workbench: Layout Preview"
        description="Adjust the split ratio used by the surrounding preview surface."
        fill
      >
        <div style={{ height: 120 }}>
          <SplitLayout
            split="vertical"
            initialHandlePosition="45%"
            start={
              <div style={{ height: '100%', padding: '10px 12px' }}>
                Navigation
              </div>
            }
            end={
              <div style={{ height: '100%', padding: '10px 12px' }}>Editor</div>
            }
          />
        </div>
      </FormGroup>
    </FormContainer>
  ),
};
