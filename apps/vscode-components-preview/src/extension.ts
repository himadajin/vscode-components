import * as vscode from 'vscode';

const OPEN_COMMAND_ID = 'vscodeComponentsPreview.open';
const PANEL_TYPE = 'vscodeComponentsPreview.panel';
const PANEL_TITLE = 'VSCode Components Preview';

let currentPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(OPEN_COMMAND_ID, () => {
      openPreviewPanel(context);
    }),
  );
}

function openPreviewPanel(context: vscode.ExtensionContext) {
  const column = vscode.window.activeTextEditor?.viewColumn;

  if (currentPanel) {
    currentPanel.reveal(column);
    return;
  }

  const extensionDistUri = vscode.Uri.joinPath(context.extensionUri, 'dist');
  const webviewRoot = vscode.Uri.joinPath(extensionDistUri, 'webview');

  const panel = vscode.window.createWebviewPanel(
    PANEL_TYPE,
    PANEL_TITLE,
    column ?? vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [webviewRoot],
    },
  );

  currentPanel = panel;
  panel.webview.html = getWebviewHtml(panel.webview, webviewRoot);

  panel.onDidDispose(
    () => {
      currentPanel = undefined;
    },
    null,
    context.subscriptions,
  );

  panel.webview.onDidReceiveMessage(
    (message: WebviewMessage) => {
      switch (message.type) {
        case 'ready':
          panel.webview.postMessage({
            type: 'open',
          } satisfies ExtensionMessage);
          return;
        case 'render-error':
          void vscode.window.showErrorMessage(
            `VSCode Components Preview failed to render: ${message.message}`,
          );
          return;
        default:
          return;
      }
    },
    null,
    context.subscriptions,
  );
}

function getWebviewHtml(
  webview: vscode.Webview,
  webviewRoot: vscode.Uri,
): string {
  const nonce = createNonce();
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(webviewRoot, 'assets', 'webview.js'),
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(webviewRoot, 'assets', 'webview.css'),
  );
  const csp = [
    "default-src 'none'",
    `img-src ${webview.cspSource} https: data:`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `font-src ${webview.cspSource}`,
    `script-src 'nonce-${nonce}'`,
    `connect-src ${webview.cspSource}`,
  ].join('; ');
  const styleHref = styleUri.toString();
  const scriptSrc = scriptUri.toString();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${PANEL_TITLE}</title>
    <link rel="stylesheet" href="${styleHref}" />
  </head>
  <body>
    <div id="root"></div>
    <script nonce="${nonce}" type="module" src="${scriptSrc}"></script>
  </body>
</html>`;
}

function createNonce() {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () =>
    alphabet.charAt(Math.floor(Math.random() * alphabet.length)),
  ).join('');
}

type WebviewMessage =
  | {
      type: 'ready';
    }
  | {
      type: 'render-error';
      message: string;
    };

type ExtensionMessage = {
  type: 'open';
};

export function deactivate() {
  currentPanel = undefined;
}
