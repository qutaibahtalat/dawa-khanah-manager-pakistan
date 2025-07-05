import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: "::",
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3004', // Backend server
        changeOrigin: true,
        rewrite: (path) => path // Do not strip /api, backend expects /api prefix
      }
    }
  },
})
