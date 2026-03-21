import { useEffect, useState } from 'react';
import { TabHeader, TabPanel, Tabs } from 'vscode-components';
import { previewsByTab } from './previews';
import { vscode } from './vscode';
import './app.css';

type ExtensionMessage = {
  type: 'open';
};

export function App() {
  const [, setOpened] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<ExtensionMessage>) => {
      if (event.data?.type === 'open') {
        setOpened(true);
      }
    };

    const reportError = (message: string) => {
      vscode.postMessage({ type: 'render-error', message });
    };

    const handleError = (event: ErrorEvent) => {
      reportError(event.message);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      reportError(
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason),
      );
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    vscode.postMessage({ type: 'ready' });

    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <main className="settings-editor preview-shell">
      <section className="settings-body preview-body">
        <Tabs
          panel
          selectedIndex={selectedTabIndex}
          onSelect={setSelectedTabIndex}
        >
          {previewsByTab.map((tab) => (
            <TabHeader key={tab.id}>{tab.label}</TabHeader>
          ))}
          {previewsByTab.map((tab) => (
            <TabPanel key={tab.id} panel>
              <div className="settings-tree-container preview-tree">
                {tab.previews.map((preview) => (
                  <article key={preview.id} className="preview-card">
                    <header className="preview-card-header">
                      <h2 className="settings-group-title-label settings-group-level-2">
                        {preview.title}
                      </h2>
                      <div
                        style={{
                          color: 'var(--vscode-descriptionForeground)',
                          fontSize: '12px',
                          lineHeight: 1.4,
                          marginTop: '-2px',
                          padding: '0 15px 10px',
                        }}
                      >
                        {preview.components.join(', ')}
                      </div>
                    </header>
                    <div className="preview-settings-row">
                      {preview.render()}
                    </div>
                  </article>
                ))}
              </div>
            </TabPanel>
          ))}
        </Tabs>
      </section>
    </main>
  );
}
