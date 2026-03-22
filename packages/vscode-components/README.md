# @himadajin/vscode-components

React components for building VS Code-like interfaces.

This package is currently in alpha. The API, styling, and package contents may change without notice.

## Requirements

- React 19 and React DOM 19
- An ESM-based bundler environment such as Vite
- CSS imports enabled in the consuming application

This package is intended for browser and VS Code webview usage. It is not designed for direct execution in Node.js or SSR environments.

## Installation

```sh
npm install react react-dom @himadajin/vscode-components
```

Import `@himadajin/vscode-components/styles.css` in all environments. On the web, also import `@himadajin/vscode-components/theme/defaults.css`.

## Usage in VS Code webviews

```tsx
import '@himadajin/vscode-components/styles.css';
import { Button } from '@himadajin/vscode-components';

export function Example() {
  return <Button>Run</Button>;
}
```

## Usage on the web

```tsx
import '@himadajin/vscode-components/styles.css';
import '@himadajin/vscode-components/theme/defaults.css';
import { Button } from '@himadajin/vscode-components';

export function Example() {
  return <Button>Run</Button>;
}
```
