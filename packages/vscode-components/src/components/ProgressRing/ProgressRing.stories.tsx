import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { ProgressRing } from './ProgressRing';

const meta = {
  title: 'Primitives/ProgressRing',
  component: ProgressRing,
  parameters: {
    layout: 'centered',
  },
  args: {
    mode: 'infinite',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressRing>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Infinite: Story = {};

export const LongRunning: Story = {
  args: {
    longRunning: true,
  },
};

export const Discrete: Story = {
  render: (args) => {
    const [value, setValue] = useState(12);

    useEffect(() => {
      const timer = window.setInterval(() => {
        setValue((current) => (current >= 100 ? 100 : current + 11));
      }, 400);

      return () => {
        window.clearInterval(timer);
      };
    }, []);

    return <ProgressRing {...args} mode="discrete" value={value} total={100} />;
  },
};

export const InSettingsItem: Story = {
  render: () => (
    <FormContainer>
      <FormGroup
        label="Extensions: Install Workspace Recommendations"
        description="Shows lightweight background activity while recommendations are being resolved."
        fill
      >
        <div style={{ width: '100%', maxWidth: 420, paddingTop: 9 }}>
          <ProgressRing ariaLabel="Installing recommendations" />
        </div>
      </FormGroup>
    </FormContainer>
  ),
};
