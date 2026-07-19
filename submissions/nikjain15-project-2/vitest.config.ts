import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// tsconfig defines `@/*` -> `./*`. Vitest resolves modules itself and doesn't read
// tsconfig paths, so it needs the same alias or `@/lib/...` imports fail at runtime
// while typecheck stays green.
const alias = { '@': fileURLToPath(new URL('.', import.meta.url)) };

// Two projects, because they need incompatible environments: unit tests are pure and
// parallel, rules tests talk to one shared emulator and must not race each other.
export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        resolve: { alias },
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
      {
        resolve: { alias },
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'node',
          // Drives the REAL lib/data functions against the emulator through the real
          // client SDK: NEXT_PUBLIC_USE_EMULATOR makes lib/firebase connect there, so the
          // firestore.rules under test apply to every write exactly as in the browser.
          env: { NEXT_PUBLIC_USE_EMULATOR: '1', NEXT_PUBLIC_EMULATOR_PROJECT: 'demo-rally' },
          // One shared emulator dataset, cleared between tests — must not race.
          fileParallelism: false,
          testTimeout: 20_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
