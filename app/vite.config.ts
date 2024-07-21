import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import webfontDownload from 'vite-plugin-webfont-dl';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

import Manifest from './public/manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webfontDownload(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'img/logo_filled.svg',
        'img/logo_filled_full.svg',
        'img/logo_outline_white.svg',
        'img/logo_outline_full.svg',
        'img/logo_outline.svg',
        'img/apple-touch-icon.png',
        'img/logo_outline_full_white_bg.svg',
        'img/logo_outline_full_white_bg_512.png',
        'img/logo_outline_full_white_bg_192.png',
        'img/favicon.ico',
        'img/favicon.svg',
        'img/pictures/stone.jpg',
      ],
      manifest: Manifest as never,
    }),
  ],
});
