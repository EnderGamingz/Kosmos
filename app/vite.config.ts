import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import webfontDownload from 'vite-plugin-webfont-dl';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), webfontDownload(), tsconfigPaths()],
});
