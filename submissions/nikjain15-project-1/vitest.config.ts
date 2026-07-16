import { defineConfig } from 'vitest/config';

// Two projects, because they need incompatible environments: unit tests are pure and
// parallel, rules tests talk to one shared emulator and must not race each other.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'rules',
          include: ['tests/rules/**/*.test.ts'],
          environment: 'node',
          // The emulator is a single shared instance holding one dataset; two files
          // clearing it concurrently would delete each other's fixtures mid-assert.
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
