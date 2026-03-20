import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { FormContainer } from '../FormContainer';
import { FormGroup } from '../FormGroup';
import { SplitLayout } from '../SplitLayout';
import { TabHeader } from '../TabHeader';
import { TabPanel } from '../TabPanel';
import { Tabs } from './Tabs';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

function TabsDemo({ panel = false }: { panel?: boolean }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Tabs
      panel={panel}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      addons={
        panel ? (
          <Button variant="secondary" style={{ marginLeft: 8 }}>
            Open View
          </Button>
        ) : null
      }
    >
      <TabHeader>General</TabHeader>
      <TabHeader after={<Badge variant="counter">3</Badge>}>Features</TabHeader>
      <TabHeader>Advanced</TabHeader>
      <TabPanel>
        <div style={{ padding: panel ? '12px 8px' : '12px 0' }}>
          General settings and section content.
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ padding: panel ? '12px 8px' : '12px 0' }}>
          Feature flags, experiments, and status counts.
        </div>
      </TabPanel>
      <TabPanel>
        <div style={{ padding: panel ? '12px 8px' : '12px 0' }}>
          Advanced overrides and workspace-specific rules.
        </div>
      </TabPanel>
    </Tabs>
  );
}

export const Default: Story = {
  render: () => <TabsDemo />,
};

export const PanelStyle: Story = {
  render: () => <TabsDemo panel />,
};

export const InSettingItem: Story = {
  render: () => (
    <FormContainer>
      <FormGroup
        label="Workbench: Editor Sections"
        description="Switch between grouped editor preferences without leaving the current settings row."
        fill
      >
        <TabsDemo />
      </FormGroup>
    </FormContainer>
  ),
};

export const WithSplitLayout: Story = {
  render: () => (
    <div style={{ height: 280 }}>
      <SplitLayout
        split="vertical"
        initialHandlePosition="38%"
        start={<TabsDemo panel />}
        end={
          <div style={{ height: '100%', padding: '12px' }}>
            Preview output appears here.
          </div>
        }
      />
    </div>
  ),
};
