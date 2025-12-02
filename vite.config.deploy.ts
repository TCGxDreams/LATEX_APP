import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/LATEX_APP/', // Replace with your repo name
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
