# @himadajin/vscode-components

React components for building VS Code-like interfaces.

This package is currently in alpha. The API, styling, and package contents may change without notice.

## Installation

```sh
npm install @himadajin/vscode-components
```

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
