import { defineConfig, devices } from '@playwright/test';

// The smoke suite is read-only and runs against the DEPLOYED url — that's the checklist's
// definition of done. The full suite CREATES accounts, projects and tasks, so it may only
// ever run against the emulator.
const DEPLOYED = 'https://pm-nikjain15.vercel.app';
const BASE_URL = process.env.BASE_URL ?? DEPLOYED;

/**
 * The guard below exists because this went wrong once, for real.
 *
 * `npm run test:e2e` sets BASE_URL=localhost, but running `npx playwright test` directly
 * leaves it unset — so it silently defaulted to the deployed URL and the sign-up helper
 * created **14 real accounts in production**, each with a `member_joined` row in the feed
 * the cohort reads. They were purged, but the member docs needed console access to remove
 * because `firestore.rules` (correctly) lets nothing delete them.
 *
 * A default that quietly writes fixtures to production is a loaded gun. Fail loudly instead.
 */
const isDestructiveRun = !process.argv.some((a) => a.includes('smoke'));
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(BASE_URL);

if (isDestructiveRun && !isLocal) {
  throw new Error(
    `Refusing to run the full e2e suite against ${BASE_URL}.\n\n` +
      `It signs up accounts and creates projects and tasks. Fixtures must never reach the\n` +
      `data reviewers read — fake cohort activity would make this submission dishonest.\n\n` +
      `Run it against the emulator:\n` +
      `  npm run emulator      # terminal 1\n` +
      `  npm run dev:emulator  # terminal 2\n` +
      `  npm run test:e2e      # terminal 3 — sets BASE_URL for you\n\n` +
      `The read-only smoke suite is the one that targets production: npm run test:e2e:smoke`
  );
}

export default defineConfig({
  testDir: 'tests/e2e',
  // OUTSIDE the project root, and this matters: Turbopack's dev server watches the
  // directory tree, so writing traces and screenshots into ./test-results triggered a
  // recompile mid-run and the app 404'd for a few seconds. The tests were breaking the
  // server they were testing, and the failures looked like product bugs.
  outputDir: '../../../.playwright-artifacts',
  // Vercel's DDoS mitigation challenges bots that hammer one IP from many workers.
  // Serial keeps the suite under that threshold; the suite is small enough not to care.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'smoke',
      testMatch: /.*\.smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'full',
      testIgnore: /.*\.smoke\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
