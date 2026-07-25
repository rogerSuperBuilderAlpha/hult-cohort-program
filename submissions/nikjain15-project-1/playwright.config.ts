import { defineConfig, devices } from '@playwright/test';

// The smoke suite is read-only and runs against the DEPLOYED url — that's the checklist's
// definition of done. The full suite CREATES accounts, projects and tasks, so it may only
// ever run against the emulator.
const DEPLOYED = 'https://pulsecohort.vercel.app';
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
// An env flag, not argv sniffing: Playwright re-imports this config inside every worker
// process, whose argv no longer carries the CLI's `--project smoke` — so the argv check
// misfired there and killed the smoke suite mid-run. Env vars reach the workers intact.
const isDestructiveRun = process.env.PLAYWRIGHT_SMOKE !== '1';
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
  // Only for local (full) runs — the smoke suite targets the deployed URL and must never
  // start a server. `reuseExistingServer` keeps the fast iterative loop working: if you
  // already have `npm run dev:emulator` up, Playwright reuses it; otherwise (e.g. the
  // self-contained `npm run test:e2e`, which wraps this in a fresh `emulators:exec`) it
  // starts one. The emulator that server talks to is whatever holds :8080 at request time
  // — the fresh, disposable one `emulators:exec` provides, which is the whole fix for the
  // WebChannel-collapse flake (TESTING.md §0): every full run starts from an empty members
  // collection, so the snapshot fan-out never grows past the collapse threshold.
  webServer: isLocal
    ? {
        command: 'npm run dev:emulator',
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,
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
