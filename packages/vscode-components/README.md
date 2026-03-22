# @himadajin/vscode-components

React components for building VS Code-like interfaces.

This package is currently in alpha. The API, styling, and package contents may change without notice.

## Requirements

- React 19 and React DOM 19
- A browser-based React app, including VS Code webviews
- A bundler that can import CSS from npm packages, such as Vite

## Installation

```sh
npm install react react-dom @himadajin/vscode-components
```

## Usage in VS Code webviews

```tsx
// main.tsx
import '@himadajin/vscode-components/styles.css';
import { Example } from './Example';

export function App() {
  return <Example />;
}
```

```tsx
// Example.tsx
import { Button } from '@himadajin/vscode-components';

export function Example() {
  return <Button>Run</Button>;
}
```

Import `@himadajin/vscode-components/styles.css` once in your webview entry file, such as `main.tsx`.

## Usage on the web

```tsx
// main.tsx
import '@himadajin/vscode-components/styles.css';
import '@himadajin/vscode-components/theme/defaults.css';
import { Example } from './Example';

export function App() {
  return <Example />;
}
```

```tsx
// Example.tsx
import { Button } from '@himadajin/vscode-components';

export function Example() {
  return <Button>Run</Button>;
}
```

In a regular web app, import `@himadajin/vscode-components/styles.css` and `@himadajin/vscode-components/theme/defaults.css` once in your app entry file, such as `main.tsx` or `App.tsx`.
