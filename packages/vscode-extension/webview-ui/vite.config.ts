import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    outDir: '../dist/webview',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // Point to the authoring package's source so we can reuse components
      '@dq-authoring': resolve(__dirname, '../../questionnaire-authoring/src'),
      // Point to the renderer source so imports resolve correctly
      '@lrama1/dynamic-questionnaire-renderer': resolve(
        __dirname,
        '../../questionnaire-renderer/src/index.ts',
      ),
    },
  },
});
