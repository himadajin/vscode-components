import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function copyThemeAssets() {
  return {
    name: 'copy-theme-assets',
    async writeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist/theme');
      await mkdir(outDir, { recursive: true });

      await copyFile(
        path.resolve(process.cwd(), 'src/theme/defaults.css'),
        path.join(outDir, 'defaults.css'),
      );
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
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
