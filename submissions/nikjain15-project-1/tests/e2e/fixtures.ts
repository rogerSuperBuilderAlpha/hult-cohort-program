import { test as base, expect } from '@playwright/test';
import { resetEmulator } from './helpers';

/**
 * The full e2e suite's shared `test`. Every full-suite spec imports `test`/`expect` from
 * here instead of `@playwright/test`, which layers one auto fixture on top: a fresh
 * emulator before each test.
 *
 * Resetting per-test (not per-file) is deliberate. The specs are independent — each signs
 * up its own account and creates uniquely-named fixtures, and none reads another test's
 * data — so wiping between them changes nothing observable except the one thing that
 * matters: the `members` collection never grows past ~one doc, so the snapshot fan-out that
 * collapses the emulator's back channel (TESTING.md §0, `resetEmulator`) never builds up.
 *
 * The smoke suite runs against production and must NOT import this — it keeps
 * `@playwright/test`, so `resetEmulator` (a localhost DELETE) never fires there.
 */
export const test = base.extend<{ freshEmulator: void }>({
  freshEmulator: [
    async ({}, use) => {
      await resetEmulator();
      await use();
    },
    { auto: true },
  ],
});

export { expect };
export type { Page } from '@playwright/test';
