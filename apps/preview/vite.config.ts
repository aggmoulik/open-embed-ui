import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  server: {
    port: 4173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/widget.js': 'http://localhost:3000',
    },
  },
  build: { outDir: 'dist' },
});
