import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/lib/bidmanager/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@/lib': path.resolve(__dirname, './src/lib'),
    },
  },
});
