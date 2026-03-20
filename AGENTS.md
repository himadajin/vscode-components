# Repository Guidelines

This project provides UI components for VS Code settings screens.

## Project Structure & Module Organization

`src/` contains the published library entrypoint, React wrappers, hooks, theme CSS, and shared types. Components live under `src/components/<ComponentName>/` and typically include `Component.tsx`, `index.ts`, optional `*.module.css`, and a colocated `*.stories.tsx` file. Shared hooks are in `src/hooks/`, theme assets are in `src/theme/`, and package exports are wired through [`src/index.ts`](/Users/taiki/repos-nodejs/vscode-components/src/index.ts). Storybook config lives in `.storybook/`; build output is generated into `dist/`.

## Build, Test, and Development Commands

Use `npm run dev` to start Storybook on port `6006` for local component development. Use `npm run build` to create the distributable ES module bundle and generated type declarations in `dist/`. Use `npm run typecheck` to run strict TypeScript checks without emitting files. Use `npm run format` to apply Prettier across the repo, and `npm run format:check` in CI-style validation. Use `npm run build:storybook` to produce the static Storybook site in `storybook-static/`.

## Coding Style & Naming Conventions

This project uses TypeScript, React JSX, and strict compiler settings. Follow Prettier defaults plus the repo rules in `.prettierrc.json`: single quotes, semicolons, and trailing commas. Match the existing style: PascalCase for component directories and component exports (`Button`, `TextInput`), camelCase for hooks (`useWebComponent`), and colocated barrel files named `index.ts`. Prefer small wrapper components around VS Code web components and keep shared exports centralized in `src/index.ts`.

## Testing Guidelines

There is no dedicated unit test runner configured yet. Treat `npm run typecheck`, `npm run build`, and Storybook stories as the current validation baseline. Add or update `*.stories.tsx` files whenever a component API or visual state changes, and verify both dark and light themes in Storybook before opening a PR.

## Commit & Pull Request Guidelines

Recent history uses short, imperative commit subjects such as `implement components` and `add .gitignore`. Keep commits focused and use the same style: concise verb-led summaries with one logical change per commit. PRs should describe the user-facing change, list validation commands run, link the relevant issue when available, and include Storybook screenshots for visual component changes.
