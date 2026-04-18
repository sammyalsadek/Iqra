import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: { outDir: 'dist' },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
});
