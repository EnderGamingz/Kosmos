import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webfontDownload from 'vite-plugin-webfont-dl';
import tailwindcss from '@tailwindcss/vite';

import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  envPrefix: ['VITE_', 'WORKERS_'],
  plugins: [react(), tailwindcss(), webfontDownload(), cloudflare()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
