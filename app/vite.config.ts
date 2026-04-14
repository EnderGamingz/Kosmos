import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webfontDownload from 'vite-plugin-webfont-dl';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  envPrefix: ['VITE_'],
  plugins: [react(), tailwindcss(), webfontDownload()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
