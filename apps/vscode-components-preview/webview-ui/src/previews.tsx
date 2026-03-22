import { useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  Collapsible,
  Divider,
  FormContainer,
  FormGroup,
  FormHelper,
  Label,
  ListEditor,
  MultiSelect,
  ObjectEditor,
  ProgressRing,
  Radio,
  RadioGroup,
  Select,
  SplitLayout,
  TabHeader,
  TabPanel,
  Textarea,
  TextInput,
  Tree,
  Tabs,
  ToolbarButton,
  ToolbarContainer,
} from 'vscode-components';

export const previewTabs = [
  { id: 'form-controls', label: 'Form Controls' },
  { id: 'data-editors', label: 'Data Editors' },
  { id: 'actions-layout', label: 'Actions & Layout' },
] as const;

export type PreviewTabId = (typeof previewTabs)[number]['id'];

type PreviewDefinition = {
  id: string;
  title: string;
  tab: PreviewTabId;
  components: string[];
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
    <FormContainer>
      <FormGroup
        category="Editor > Font"
        label="Editor: Font Size"
        description="Controls the font size in pixels."
        fill
      >
        <TextInput
          type="number"
          value={fontSize}
          onChange={setFontSize}
          placeholder="14"
        />
      </FormGroup>
      <FormGroup
        label="Files: Auto Save"
        description="Saves dirty files automatically after a short delay."
        modified={autoSave}
      >
        <Checkbox
          label={autoSave ? 'Enabled' : 'Disabled'}
          checked={autoSave}
          onChange={setAutoSave}
        />
      </FormGroup>
      <FormGroup
        label="Workbench: Color Theme"
        description="Specifies the color theme used in the workbench."
        fill
      >
        <Select
          enum={['Default Dark+', 'Light+', 'High Contrast Dark']}
          value={theme}
          onChange={setTheme}
        />
      </FormGroup>
      <FormGroup
        label="Workbench: Preferred Settings Target"
        description="Controls where a changed setting is written when multiple scopes are available."
      >
        <RadioGroup orientation="vertical" value={target} onChange={setTarget}>
          <Radio value="user">User</Radio>
          <Radio value="workspace">Workspace</Radio>
          <Radio value="folder">Folder</Radio>
        </RadioGroup>
      </FormGroup>
      <FormGroup
        label="Chat: System Prompt"
        description="Provides the base prompt used for prompt-driven editing and review tasks."
        fill
      >
        <Textarea
          rows={4}
          monospace
          value={systemPrompt}
          onChange={setSystemPrompt}
          placeholder="Enter a system prompt"
        />
      </FormGroup>
      <Divider />
      <FormGroup
        label="Chat: Command Prefix"
        description="Separates the main prompt from the optional command prefix used by slash-style actions."
        helper={
          <FormHelper tone="info">
            Provide the primary alias first, then an optional fallback alias.
          </FormHelper>
        }
        fill
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
      </FormGroup>
    </FormContainer>
  );
}

function LabelPreview() {
  return (
    <>
      <div className="preview-inline-setting">
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
      </div>
      <FormContainer>
        <FormGroup
          label="Accessibility: Accessible Form Labels"
          description="Uses the standalone Label component inside a setting row for additional control-specific context."
          fill
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
        </FormGroup>
      </FormContainer>
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
    <FormContainer>
      <FormGroup
        label="Files: Associations"
        description="Configure glob patterns for associated file types."
        helper={
          <FormHelper tone="info">
            Double-click an item to edit it, or drag rows to reorder them.
          </FormHelper>
        }
        fill
      >
        <ListEditor
          value={associations}
          onChange={setAssociations}
          itemSchema={{ type: 'string' }}
        />
      </FormGroup>
      <FormGroup
        label="[TypeScript]: Editor Overrides"
        description="Applies language-specific settings for TypeScript files."
        helper="Only schema-defined keys can be added in this editor."
        fill
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
      </FormGroup>
    </FormContainer>
  );
}

function ActionsPreview() {
  const [launchCount, setLaunchCount] = useState(1);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [readonlyScopes, setReadonlyScopes] = useState(['typescript', 'json']);

  return (
    <>
      <div className="preview-toolbar">
        <div className="preview-toolbar-group">
          <ToolbarContainer ariaLabel="Preview actions">
            <ToolbarButton
              icon="refresh"
              label="Refresh Preview"
              onClick={() => setLaunchCount((count) => count + 1)}
            />
            <ToolbarButton
              icon="sync"
              label="Toggle Sync"
              toggleable
              checked={syncEnabled}
              onClick={() => setSyncEnabled((current) => !current)}
            />
            <ToolbarButton icon="gear" label="Configure" />
          </ToolbarContainer>
          <ButtonGroup ariaLabel="Transport controls">
            <ToolbarButton icon="chevron-left" label="Previous" />
            <ToolbarButton icon="play" label="Run" />
            <ToolbarButton icon="chevron-right" label="Next" />
          </ButtonGroup>
        </div>
        <div className="preview-toolbar-group">
          <div style={{ width: 120 }}>
            <ProgressRing
              ariaLabel="Background sync in progress"
              longRunning={syncEnabled}
            />
          </div>
          <Badge variant="counter">{launchCount}</Badge>
          <Badge>{syncEnabled ? 'Active' : 'Paused'}</Badge>
        </div>
      </div>
      <FormContainer>
        <FormGroup
          label="Settings Sync: Enabled"
          description="Synchronizes your user settings across devices."
          modified={syncEnabled}
        >
          <Checkbox
            toggle
            checked={syncEnabled}
            onChange={setSyncEnabled}
            label={syncEnabled ? 'On' : 'Off'}
          />
        </FormGroup>
        <FormGroup
          label="Files: Readonly Include"
          description="Select the languages that stay readonly during background runs."
          fill
        >
          <MultiSelect
            fill
            enum={['typescript', 'javascript', 'json', 'markdown']}
            enumItemLabels={['TypeScript', 'JavaScript', 'JSON', 'Markdown']}
            value={readonlyScopes}
            onChange={setReadonlyScopes}
          />
        </FormGroup>
      </FormContainer>
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
        </FormGroup>
      </FormContainer>
    </>
  );
}

function NavigationLayoutPreview() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [splitPosition, setSplitPosition] = useState('42%');

  return (
    <>
      <FormContainer>
        <FormGroup
          label="Workbench: Section Tabs"
          description="Switch between grouped configuration sections using an editor-like tab strip."
          fill
        >
          <Tabs
            panel
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            addons={<Button variant="secondary">Open Section</Button>}
          >
            <TabHeader>General</TabHeader>
            <TabHeader>Search</TabHeader>
            <TabHeader>Advanced</TabHeader>
            <TabPanel panel>
              <div style={{ padding: '12px 8px' }}>
                General preferences and section content.
              </div>
            </TabPanel>
            <TabPanel panel>
              <div style={{ padding: '12px 8px' }}>
                Search-related controls and indexing options.
              </div>
            </TabPanel>
            <TabPanel panel>
              <div style={{ padding: '12px 8px' }}>
                Advanced configuration and hidden overrides.
              </div>
            </TabPanel>
          </Tabs>
        </FormGroup>
        <FormGroup
          label="Workbench: Split View"
          description="Resize adjacent panes using the same sash interaction as VS Code split views."
          fill
        >
          <div style={{ height: 260 }}>
            <SplitLayout
              split="vertical"
              handlePosition={splitPosition}
              initialHandlePosition="42%"
              onChange={({ positionInPercentage }) =>
                setSplitPosition(`${positionInPercentage}%`)
              }
              start={
                <div style={{ height: '100%', padding: '12px' }}>
                  Explorer pane
                </div>
              }
              end={
                <div style={{ height: '100%', padding: '12px' }}>
                  Editor pane
                </div>
              }
            />
          </div>
        </FormGroup>
      </FormContainer>
    </>
  );
}

function TreePreview() {
  const [selectedIds, setSelectedIds] = useState(['tree-tree-tsx']);

  return (
    <FormContainer>
      <FormGroup
        label="Explorer: File Tree"
        description="VS Code style hierarchical navigation with twisties, keyboard navigation, and selection state."
        fill
      >
        <Tree
          ariaLabel="Explorer preview"
          items={[
            {
              id: 'tree-src',
              label: 'src',
              icon: 'folder',
              children: [
                {
                  id: 'tree-components',
                  label: 'components',
                  icon: 'folder',
                  children: [
                    {
                      id: 'tree-tree-tsx',
                      label: 'Tree.tsx',
                      icon: 'symbol-class',
                    },
                    {
                      id: 'tree-tree-css',
                      label: 'Tree.module.css',
                      icon: 'symbol-color',
                    },
                  ],
                },
                { id: 'tree-index', label: 'index.ts', icon: 'symbol-file' },
              ],
            },
            {
              id: 'tree-package',
              label: 'package.json',
              icon: 'json',
              badge: 'M',
            },
          ]}
          defaultExpandedIds={['tree-src', 'tree-components']}
          focusedId={selectedIds[0] ?? null}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          onFocusedIdChange={(focusedId) =>
            setSelectedIds(focusedId ? [focusedId] : [])
          }
          renderIndentGuides="onHover"
          style={{
            width: '100%',
            maxWidth: 420,
            height: 220,
            border: '1px solid var(--vscode-panel-border)',
          }}
        />
      </FormGroup>
      <FormGroup
        label="Workbench: Settings Categories"
        description="Matches the category-navigation pattern used by the Settings editor."
        fill
      >
        <Tree
          ariaLabel="Settings categories preview"
          items={[
            {
              id: 'settings-common',
              label: 'Most Commonly Used',
              icon: 'star-full',
            },
            {
              id: 'settings-editor',
              label: 'Text Editor',
              icon: 'edit',
              children: [
                { id: 'settings-font', label: 'Font', icon: 'symbol-number' },
                {
                  id: 'settings-cursor',
                  label: 'Cursor',
                  icon: 'symbol-key',
                },
                { id: 'settings-diff', label: 'Diff Editor', icon: 'diff' },
              ],
            },
            {
              id: 'settings-features',
              label: 'Features',
              icon: 'extensions',
              children: [
                {
                  id: 'settings-explorer',
                  label: 'Explorer',
                  icon: 'files',
                },
                { id: 'settings-search', label: 'Search', icon: 'search' },
                { id: 'settings-chat', label: 'Chat', icon: 'comment' },
              ],
            },
          ]}
          defaultExpandedIds={['settings-editor', 'settings-features']}
          defaultSelectedIds={['settings-chat']}
          defaultFocusedId="settings-chat"
          renderIndentGuides="always"
          style={{
            width: '100%',
            maxWidth: 420,
            height: 240,
            border: '1px solid var(--vscode-panel-border)',
          }}
        />
      </FormGroup>
    </FormContainer>
  );
}

export const previews: PreviewDefinition[] = [
  {
    id: 'label',
    title: 'Labels',
    tab: 'form-controls',
    components: ['Label', 'TextInput', 'FormContainer', 'FormGroup'],
    render: () => <LabelPreview />,
  },
  {
    id: 'form',
    title: 'Form Layout',
    tab: 'form-controls',
    components: [
      'FormContainer',
      'FormGroup',
      'FormHelper',
      'TextInput',
      'Checkbox',
    ],
    render: () => <FormPreview />,
  },
  {
    id: 'controls',
    title: 'Primitive Controls',
    tab: 'form-controls',
    components: [
      'FormContainer',
      'FormGroup',
      'TextInput',
      'Checkbox',
      'Select',
      'RadioGroup',
      'Radio',
      'Textarea',
      'Divider',
      'FormHelper',
    ],
    render: () => <ControlsPreview />,
  },
  {
    id: 'collapsible',
    title: 'Collapsible Sections',
    tab: 'data-editors',
    components: [
      'Collapsible',
      'Badge',
      'Button',
      'FormContainer',
      'FormGroup',
      'TextInput',
    ],
    render: () => <CollapsiblePreview />,
  },
  {
    id: 'collections',
    title: 'Composite Editors',
    tab: 'data-editors',
    components: [
      'FormContainer',
      'FormGroup',
      'FormHelper',
      'ListEditor',
      'ObjectEditor',
    ],
    render: () => <CollectionPreview />,
  },
  {
    id: 'tree',
    title: 'Navigation Tree',
    tab: 'data-editors',
    components: ['Tree', 'FormContainer', 'FormGroup'],
    render: () => <TreePreview />,
  },
  {
    id: 'actions',
    title: 'Command Surface',
    tab: 'actions-layout',
    components: [
      'ToolbarContainer',
      'ToolbarButton',
      'ButtonGroup',
      'Badge',
      'ProgressRing',
      'FormContainer',
      'FormGroup',
      'Checkbox',
      'MultiSelect',
    ],
    render: () => <ActionsPreview />,
  },
  {
    id: 'navigation-layout',
    title: 'Navigation & Layout',
    tab: 'actions-layout',
    components: [
      'Tabs',
      'TabHeader',
      'TabPanel',
      'SplitLayout',
      'FormContainer',
      'FormGroup',
      'Button',
    ],
    render: () => <NavigationLayoutPreview />,
  },
];

export const previewsByTab = previewTabs.map((tab) => ({
  ...tab,
  previews: previews.filter((preview) => preview.tab === tab.id),
}));
