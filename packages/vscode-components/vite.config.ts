import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);

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

function resolvePackageAsset(specifier: string): string {
  return require.resolve(specifier);
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
      const codiconDistDir = path.join(distDir, 'assets');
      const codiconSourceCssPath = resolvePackageAsset(
        '@vscode/codicons/dist/codicon.css',
      );
      const codiconSourceFontPath = resolvePackageAsset(
        '@vscode/codicons/dist/codicon.ttf',
      );
      const generatedCssFiles = await findGeneratedCssFiles(distDir);

      if (generatedCssFiles.length !== 1) {
        throw new Error(
          `Expected exactly one generated CSS asset, found ${generatedCssFiles.length}.`,
        );
      }

      await mkdir(themeDir, { recursive: true });
      await mkdir(codiconDistDir, { recursive: true });

      await copyFile(
        path.resolve(process.cwd(), 'src/theme/defaults.css'),
        path.join(themeDir, 'defaults.css'),
      );

      const [generatedCssPath] = generatedCssFiles;

      if (generatedCssPath !== stylesPath) {
        await rename(generatedCssPath, stylesPath);
      }

      const [stylesCss, codiconCss] = await Promise.all([
        readFile(stylesPath, 'utf8'),
        readFile(codiconSourceCssPath, 'utf8'),
        copyFile(
          codiconSourceFontPath,
          path.join(codiconDistDir, 'codicon.ttf'),
        ),
      ]);

      const rewrittenCodiconCss = codiconCss.replaceAll(
        './codicon.ttf?721d4c0a96379d0c13d3d5596893c348',
        './assets/codicon.ttf',
      );

      await writeFile(stylesPath, `${rewrittenCodiconCss}\n${stylesCss}`);

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
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
