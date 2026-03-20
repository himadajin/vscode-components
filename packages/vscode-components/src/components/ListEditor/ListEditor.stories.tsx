import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ListEditor } from './ListEditor';

const meta = {
  title: 'Composite/ListEditor',
  component: ListEditor,
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
} satisfies Meta<typeof ListEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

function StatefulStringStory({
  initialValue,
  reorderable = true,
  itemSchema,
}: {
  initialValue: string[];
  reorderable?: boolean;
  itemSchema: React.ComponentProps<typeof ListEditor<string>>['itemSchema'];
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <ListEditor
      value={value}
      onChange={setValue}
      reorderable={reorderable}
      itemSchema={itemSchema}
    />
  );
}

function StatefulNumberStory({
  initialValue,
  itemSchema,
}: {
  initialValue: number[];
  itemSchema: React.ComponentProps<typeof ListEditor<number>>['itemSchema'];
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <ListEditor value={value} onChange={setValue} itemSchema={itemSchema} />
  );
}

export const StringList: Story = {
  args: { value: [], onChange: () => undefined },
  render: () => (
    <StatefulStringStory
      initialValue={['alpha', 'beta', 'gamma']}
      itemSchema={{ type: 'string' }}
    />
  ),
};
export const EnumList: Story = {
  args: { value: [], onChange: () => undefined },
  render: () => (
    <StatefulStringStory
      initialValue={['auto', 'off']}
      itemSchema={{
        type: 'string',
        enum: ['on', 'off', 'auto'],
        enumDescriptions: ['Enable', 'Disable', 'Auto'],
      }}
    />
  ),
};
export const NumberList: Story = {
  args: { value: [], onChange: () => undefined },
  render: () => (
    <StatefulNumberStory
      initialValue={[8, 16, 24]}
      itemSchema={{ type: 'number' }}
    />
  ),
};
export const EmptyState: Story = {
  args: { value: [], onChange: () => undefined },
  render: () => (
    <StatefulStringStory initialValue={[]} itemSchema={{ type: 'string' }} />
  ),
};
export const NonReorderable: Story = {
  args: { value: [], onChange: () => undefined },
  render: () => (
    <StatefulStringStory
      initialValue={['alpha', 'beta', 'gamma']}
      reorderable={false}
      itemSchema={{ type: 'string' }}
    />
  ),
};
