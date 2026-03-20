declare const acquireVsCodeApi:
  | undefined
  | (() => {
      postMessage: (message: unknown) => void;
    });

type VsCodeApi = {
  postMessage: (message: unknown) => void;
};

const fallbackApi: VsCodeApi = {
  postMessage: () => undefined,
};

export const vscode = acquireVsCodeApi?.() ?? fallbackApi;
