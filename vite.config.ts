import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true })],
  build: {
    emptyOutDir: false,
    lib: {
      formats: ['es'],
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      fileName: 'index',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'jotai'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
  },
});
