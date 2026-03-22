# Repository Guidelines

This project provides VSCode-like React components.

## Project Structure & Module Organization

The workspace is split into `packages/*` and `apps/*`. The published component library lives in [`packages/vscode-components`](packages/vscode-components), with source under [`packages/vscode-components/src`](packages/vscode-components/src), Storybook config in [`packages/vscode-components/.storybook`](packages/vscode-components/.storybook), and distributable output in [`packages/vscode-components/dist`](packages/vscode-components/dist). Components live under `src/components/<ComponentName>/` and usually include `Component.tsx`, `index.ts`, optional `*.module.css`, and colocated `*.stories.tsx` files. Shared hooks are in `src/hooks/`, theme assets are in `src/theme/`, shared types are in `src/types/`, and the public package exports are wired through [`packages/vscode-components/src/index.ts`](packages/vscode-components/src/index.ts).

The VS Code extension lives in [`apps/vscode-components-preview`](apps/vscode-components-preview). The extension entrypoint is [`apps/vscode-components-preview/src/extension.ts`](apps/vscode-components-preview/src/extension.ts), and the webview UI lives under [`apps/vscode-components-preview/webview-ui/src`](apps/vscode-components-preview/webview-ui/src). Built extension assets are emitted to [`apps/vscode-components-preview/dist`](apps/vscode-components-preview/dist).

## Build, Test, and Development Commands

- `npm run dev`: Start Storybook for the component library.
- `npm run dev:extension`: Watch and build the preview extension and webview assets.
- `npm run build`: Build all workspaces.
- `npm run build --workspace=@himadajin/vscode-components`: Build only the component library.
- `npm run build --workspace=vscode-components-preview`: Build only the preview extension.
- `npm run typecheck`: Run workspace-wide TypeScript checks.
- `npm run lint`: Run ESLint.
- `npm run check`: Run the main validation pass used in CI-style checks.
- `npm run format`: Apply Prettier formatting.
- `npm run format:check`: Verify Prettier formatting.
- `npm run build:storybook`: Generate the static Storybook site.

## Coding Style & Naming Conventions

This project uses TypeScript, React JSX, strict compiler settings, and flat-config ESLint in [`eslint.config.mjs`](eslint.config.mjs). Follow Prettier defaults plus the repo rules in [`.prettierrc.json`](.prettierrc.json): single quotes, semicolons, and trailing commas. Match the existing style: PascalCase for component directories and component exports (`Button`, `TextInput`, `ToolbarButton`), camelCase for hooks (`useWebComponent`), and colocated barrel files named `index.ts`. Keep library exports centralized in [`packages/vscode-components/src/index.ts`](packages/vscode-components/src/index.ts). For the extension, keep Node-facing code in `src/extension.ts` and browser-facing webview code under `webview-ui/src`.

## Testing Guidelines

There is no dedicated unit test runner configured yet. For component changes, add or update the colocated `*.stories.tsx` files in [`packages/vscode-components/src/components`](packages/vscode-components/src/components) and verify both dark and light themes in Storybook. For extension or webview changes, verify the preview extension renders the expected component states inside VS Code.

## Development Rules

These rules apply to every code-editing task, even when no commit will be created.

- `Always`:
  - After modifying code, run `npm run format`.
  - After modifying code, run `npm run check` and confirm it passes.
  - After modifying code, run the relevant build command and confirm it succeeds.
  - Keep instructions concise, scannable, and tied to real repository commands and files.
- `Ask First`:
  - Adding new dependencies.
  - Deleting files or directories.
  - Making changes that affect release or CI behavior beyond the current task.
- `Never`:
  - Skip formatting, validation, or build verification after code changes.
  - Invent commands or workflows that are not defined in this repository.

## Commit & Pull Request Guidelines

Keep commit subjects short, imperative, and focused on one logical change, using concise subjects such as `implement table`, `implement components`, or `add README.md`. PRs should describe the user-facing change, list validation commands run, link the relevant issue when available, and include Storybook screenshots for library UI changes or VS Code/webview screenshots for extension-facing changes.
