import { copyFile, mkdir, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import react from '@vitejs/plugin-react';

async function findGeneratedCssFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findGeneratedCssFiles(entryPath)));
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith('.css') &&
      entryPath !== path.resolve(process.cwd(), 'dist/theme/defaults.css') &&
      entryPath !== path.resolve(process.cwd(), 'dist/styles.css')
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

function copyThemeAssets(): Plugin {
  let shouldRun = false;

  return {
    name: 'copy-theme-assets',
    configResolved(config: ResolvedConfig) {
      shouldRun = Boolean(config.build.lib);
    },
    async writeBundle() {
      if (!shouldRun) {
        return;
      }

      const distDir = path.resolve(process.cwd(), 'dist');
      const themeDir = path.join(distDir, 'theme');
      const stylesPath = path.join(distDir, 'styles.css');
      const generatedCssFiles = await findGeneratedCssFiles(distDir);

      if (generatedCssFiles.length !== 1) {
        throw new Error(
          `Expected exactly one generated CSS asset, found ${generatedCssFiles.length}.`,
        );
      }

      await mkdir(themeDir, { recursive: true });

      await copyFile(
        path.resolve(process.cwd(), 'src/theme/defaults.css'),
        path.join(themeDir, 'defaults.css'),
      );

      const [generatedCssPath] = generatedCssFiles;

      if (generatedCssPath !== stylesPath) {
        await rename(generatedCssPath, stylesPath);
      }

      const generatedCssDir = path.dirname(generatedCssPath);
      if (generatedCssDir !== distDir) {
        const remainingEntries = await readdir(generatedCssDir);
        if (remainingEntries.length === 0) {
          await rm(generatedCssDir, { recursive: true, force: true });
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyThemeAssets()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@vscode/codicons/dist/codicon.css',
      ],
    },
  },
});
