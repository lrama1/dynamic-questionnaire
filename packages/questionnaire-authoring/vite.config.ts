import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@lrama1/dynamic-questionnaire-renderer': resolve(
        __dirname,
        '../questionnaire-renderer/src/index.ts',
      ),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
