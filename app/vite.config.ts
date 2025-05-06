import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webfontDownload from 'vite-plugin-webfont-dl';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePWA } from 'vite-plugin-pwa';

import Manifest from './public/manifest.json';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  envPrefix: ['VITE_', 'CF_PAGES_'],
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
    webfontDownload(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/',
      workbox: {
        cacheId: 'kosmos',
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        sourcemap: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        importScripts: ['/service_worker/push.js'],
      },
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
        'img/pictures/hero.jpg',
      ],
      manifest: Manifest as never,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
