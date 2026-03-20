import { useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  ListEditor,
  ObjectEditor,
  Select,
  SettingItem,
  TextInput,
} from 'vscode-components';

type PreviewDefinition = {
  id: string;
  title: string;
  render: () => ReactNode;
};

function ControlsPreview() {
  const [fontSize, setFontSize] = useState('14');
  const [autoSave, setAutoSave] = useState(true);
  const [theme, setTheme] = useState('Default Dark+');

  return (
    <>
      <SettingItem
        category="Editor > Font"
        title="Editor: Font Size"
        description="Controls the font size in pixels."
        className="setting-item setting-item-number"
      >
        <TextInput
          type="number"
          value={fontSize}
          onChange={setFontSize}
          placeholder="14"
        />
      </SettingItem>
      <SettingItem
        title="Files: Auto Save"
        description="Saves dirty files automatically after a short delay."
        modified={autoSave}
        className="setting-item setting-item-bool"
      >
        <Checkbox
          label={autoSave ? 'Enabled' : 'Disabled'}
          checked={autoSave}
          onChange={setAutoSave}
        />
      </SettingItem>
      <SettingItem
        title="Workbench: Color Theme"
        description="Specifies the color theme used in the workbench."
        className="setting-item setting-item-enum"
      >
        <Select
          enum={['Default Dark+', 'Light+', 'High Contrast Dark']}
          value={theme}
          onChange={setTheme}
        />
      </SettingItem>
    </>
  );
}

function CollectionPreview() {
  const [associations, setAssociations] = useState(['*.md', '*.txt']);
  const [languageOverrides, setLanguageOverrides] = useState<
    Record<string, number>
  >({
    'editor.fontSize': 14,
    'files.autoSaveDelay': 1000,
  });

  return (
    <>
      <SettingItem
        title="Files: Associations"
        description="Configure glob patterns for associated file types."
        className="setting-item setting-item-list"
      >
        <ListEditor
          value={associations}
          onChange={setAssociations}
          itemSchema={{ type: 'string' }}
        />
      </SettingItem>
      <SettingItem
        title="[TypeScript]: Editor Overrides"
        description="Applies language-specific settings for TypeScript files."
        className="setting-item setting-item-list"
      >
        <ObjectEditor
          value={languageOverrides}
          onChange={setLanguageOverrides}
          defaultValue={{ 'editor.fontSize': 14 }}
          schema={{
            properties: {
              'editor.fontSize': { type: 'number', default: 14 },
              'files.autoSaveDelay': { type: 'number', default: 1000 },
            },
          }}
        />
      </SettingItem>
    </>
  );
}

function ActionsPreview() {
  const [launchCount, setLaunchCount] = useState(1);
  const [syncEnabled, setSyncEnabled] = useState(true);

  return (
    <>
      <div className="preview-toolbar">
        <div className="preview-toolbar-group">
          <Button onClick={() => setLaunchCount((count) => count + 1)}>
            Refresh Preview
          </Button>
          <Button
            variant="secondary"
            iconAfter="arrow-right"
            onClick={() => setSyncEnabled((current) => !current)}
          >
            {syncEnabled ? 'Disable Sync' : 'Enable Sync'}
          </Button>
        </div>
        <div className="preview-toolbar-group">
          <Badge variant="counter">{launchCount}</Badge>
          <Badge>{syncEnabled ? 'Active' : 'Paused'}</Badge>
        </div>
      </div>
      <SettingItem
        title="Settings Sync: Enabled"
        description="Synchronizes your user settings across devices."
        modified={syncEnabled}
        className="setting-item setting-item-bool"
      >
        <Checkbox
          toggle
          checked={syncEnabled}
          onChange={setSyncEnabled}
          label={syncEnabled ? 'On' : 'Off'}
        />
      </SettingItem>
    </>
  );
}

export const previews: PreviewDefinition[] = [
  {
    id: 'controls',
    title: 'Primitive Controls',
    render: () => <ControlsPreview />,
  },
  {
    id: 'collections',
    title: 'Composite Editors',
    render: () => <CollectionPreview />,
  },
  {
    id: 'actions',
    title: 'Command Surface',
    render: () => <ActionsPreview />,
  },
];
