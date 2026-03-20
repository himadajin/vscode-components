import { useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Checkbox,
  Collapsible,
  Divider,
  FormContainer,
  FormGroup,
  FormHelper,
  Icon,
  Label,
  ListEditor,
  ObjectEditor,
  Radio,
  RadioGroup,
  Select,
  SettingItem,
  Textarea,
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
  const [target, setTarget] = useState('workspace');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a precise assistant.\nSummarize changes before proposing code.',
  );

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
      <SettingItem
        title="Workbench: Preferred Settings Target"
        description="Controls where a changed setting is written when multiple scopes are available."
        className="setting-item setting-item-enum"
      >
        <RadioGroup orientation="vertical" value={target} onChange={setTarget}>
          <Radio value="user">User</Radio>
          <Radio value="workspace">Workspace</Radio>
          <Radio value="folder">Folder</Radio>
        </RadioGroup>
      </SettingItem>
      <SettingItem
        title="Chat: System Prompt"
        description="Provides the base prompt used for prompt-driven editing and review tasks."
        className="setting-item setting-item-text"
      >
        <Textarea
          rows={4}
          monospace
          value={systemPrompt}
          onChange={setSystemPrompt}
          placeholder="Enter a system prompt"
        />
      </SettingItem>
      <Divider />
      <SettingItem
        title="Chat: Command Prefix"
        description="Separates the main prompt from the optional command prefix used by slash-style actions."
        className="setting-item setting-item-text"
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <TextInput
            defaultValue="/review"
            style={{ width: '100%', maxWidth: 'none' }}
          />
          <Divider />
          <TextInput
            defaultValue="/fix"
            style={{ width: '100%', maxWidth: 'none' }}
          />
        </div>
      </SettingItem>
    </>
  );
}

function LabelPreview() {
  return (
    <>
      <div style={{ width: 'min(420px, 100%)', marginBottom: 18 }}>
        <Label
          category="Editor > Font"
          htmlFor="preview-label-font-size"
          description="Controls the font size in pixels."
        >
          Editor: Font Size
        </Label>
        <div style={{ marginTop: 9 }}>
          <TextInput
            id="preview-label-font-size"
            defaultValue={14}
            type="number"
          />
        </div>
      </div>
      <SettingItem
        title="Accessibility: Accessible Form Labels"
        description="Uses the standalone Label component inside a setting row for additional control-specific context."
        className="setting-item setting-item-text"
      >
        <div
          style={{
            width: 'min(420px, 100%)',
            display: 'grid',
            gap: '9px',
          }}
        >
          <Label
            htmlFor="preview-command-alias"
            description="Clicking this text should focus the input below."
          >
            Command Alias
          </Label>
          <TextInput
            id="preview-command-alias"
            defaultValue="workbench.action.showCommands"
          />
        </div>
      </SettingItem>
    </>
  );
}

function FormPreview() {
  const [fontSize, setFontSize] = useState('14');
  const [fontFamily, setFontFamily] = useState('Consolas');
  const [trimTrailingWhitespace, setTrimTrailingWhitespace] = useState(true);
  const invalid = Number(fontSize) < 6 || Number(fontSize) > 100;

  return (
    <FormContainer>
      <FormGroup
        label="Editor: Font Size"
        description="Controls the font size in pixels."
        helper={
          invalid ? (
            <FormHelper tone="error">
              The value must be an integer between 6 and 100.
            </FormHelper>
          ) : (
            'Minimum value is 6.'
          )
        }
        fill
      >
        <TextInput type="number" value={fontSize} onChange={setFontSize} />
      </FormGroup>
      <FormGroup
        label="Editor: Font Family"
        description="Controls the font family."
        helper={<FormHelper tone="info">Comma separated font list.</FormHelper>}
        fill
      >
        <TextInput value={fontFamily} onChange={setFontFamily} />
      </FormGroup>
      <FormGroup
        label="Files: Trim Trailing Whitespace"
        description="Remove trailing auto inserted whitespace."
        modified={trimTrailingWhitespace}
      >
        <Checkbox
          toggle
          checked={trimTrailingWhitespace}
          onChange={setTrimTrailingWhitespace}
          label={trimTrailingWhitespace ? 'Enabled' : 'Disabled'}
        />
      </FormGroup>
    </FormContainer>
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
          <Icon name="sync" icon="sync~spin" aria-hidden="true" />
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

function CollapsiblePreview() {
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(true);

  return (
    <>
      <Collapsible
        title="Files Explorer"
        description="3 changes"
        open={explorerOpen}
        onOpenChange={setExplorerOpen}
        decorations={<Badge variant="counter">3</Badge>}
        actions={
          <Button variant="secondary" onClick={() => setExplorerOpen(true)}>
            Reveal All
          </Button>
        }
      >
        <div style={{ padding: '10px 8px 12px 22px' }}>
          <div>src</div>
          <div>package.json</div>
          <div>README.md</div>
        </div>
      </Collapsible>
      <SettingItem
        title="Workbench: Startup Editor"
        description="Controls which editor is shown at startup."
        className="setting-item setting-item-list"
      >
        <Collapsible
          title="Advanced startup rules"
          description="workspace overrides"
          open={rulesOpen}
          onOpenChange={setRulesOpen}
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
      </SettingItem>
    </>
  );
}

export const previews: PreviewDefinition[] = [
  {
    id: 'label',
    title: 'Labels',
    render: () => <LabelPreview />,
  },
  {
    id: 'form',
    title: 'Form Layout',
    render: () => <FormPreview />,
  },
  {
    id: 'controls',
    title: 'Primitive Controls',
    render: () => <ControlsPreview />,
  },
  {
    id: 'collapsible',
    title: 'Collapsible Sections',
    render: () => <CollapsiblePreview />,
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
