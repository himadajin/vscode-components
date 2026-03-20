import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ObjectEditor } from './ObjectEditor';

const meta = {
  title: 'Composite/ObjectEditor',
  component: ObjectEditor,
  parameters: {
    layout: 'fullscreen',
    vscodePreview: 'settings',
  },
} satisfies Meta<typeof ObjectEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

function StatefulStringStory({
  initialValue,
  schema,
}: {
  initialValue: Record<string, string>;
  schema?: React.ComponentProps<typeof ObjectEditor<string>>['schema'];
}) {
  const [value, setValue] = useState(initialValue);
  return <ObjectEditor value={value} onChange={setValue} schema={schema} />;
}

function StatefulNumberStory({
  initialValue,
  schema,
  defaultValue,
}: {
  initialValue: Record<string, number>;
  schema?: React.ComponentProps<typeof ObjectEditor<number>>['schema'];
  defaultValue?: Record<string, number>;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <ObjectEditor
      value={value}
      onChange={setValue}
      schema={schema}
      defaultValue={defaultValue}
    />
  );
}

export const SimpleKeyValue: Story = {
  args: { value: {}, onChange: () => undefined },
  render: () => (
    <StatefulStringStory
      initialValue={{ 'files.autoSave': 'afterDelay', 'editor.wordWrap': 'on' }}
    />
  ),
};
export const WithSchemaSuggestions: Story = {
  args: { value: {}, onChange: () => undefined },
  render: () => (
    <StatefulStringStory
      initialValue={{ 'files.autoSave': 'afterDelay', 'editor.wordWrap': 'on' }}
      schema={{
        properties: {
          'files.autoSave': {
            type: 'string',
            enum: ['off', 'afterDelay', 'onFocusChange'],
          },
          'editor.fontSize': { type: 'number', default: 14 },
          'editor.minimap.enabled': { type: 'boolean', default: true },
        },
      }}
    />
  ),
};
export const WithDefaults: Story = {
  args: { value: {}, onChange: () => undefined },
  render: () => (
    <StatefulNumberStory
      initialValue={{ 'editor.fontSize': 18 }}
      defaultValue={{ 'editor.fontSize': 14 }}
      schema={{
        properties: { 'editor.fontSize': { type: 'number', default: 14 } },
      }}
    />
  ),
};
