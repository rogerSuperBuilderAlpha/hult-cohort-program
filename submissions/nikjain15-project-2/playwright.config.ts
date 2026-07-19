import { defineConfig, devices } from '@playwright/test';

// The smoke suite is read-only and runs against Rally's DEPLOYED url — that's the checklist's
// definition of done. The full suite CREATES accounts, channels and messages, so it may only
// ever run against the emulator. DEPLOYED is Rally's OWN Vercel target — NEVER Pulse's
// pm-nikjain15 (clobber hazard; see memory pulse-deploy-mechanism). Override with BASE_URL.
const DEPLOYED = process.env.RALLY_URL ?? 'https://rally-nikjain15.vercel.app';
const BASE_URL = process.env.BASE_URL ?? DEPLOYED;

// A default that quietly writes fixtures to production is a loaded gun (this bit Pulse once —
// 14 real accounts created in prod). The full suite refuses any non-local target. Env flag,
// not argv sniffing: Playwright re-imports this config inside every worker, whose argv no
// longer carries `--project smoke`.
const isDestructiveRun = process.env.PLAYWRIGHT_SMOKE !== '1';
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(BASE_URL);

if (isDestructiveRun && !isLocal) {
  throw new Error(
    `Refusing to run the full e2e suite against ${BASE_URL}.\n\n` +
      `It signs up accounts and creates channels and messages. Fixtures must never reach the\n` +
      `data reviewers read. Run it against the emulator:\n` +
      `  npm run emulator      # terminal 1\n` +
      `  npm run dev:emulator  # terminal 2\n` +
      `  npm run test:e2e      # terminal 3 — sets BASE_URL for you\n\n` +
      `The read-only smoke suite is the one that targets production: npm run test:e2e:smoke`
  );
}

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: '../../../.playwright-artifacts',
  // Warm the lazily-compiled dev routes once, so no single test pays the cold Turbopack compile.
  // Only meaningful for local (full) runs that start the dev server; harmless for the smoke run.
  globalSetup: isLocal ? './tests/e2e/global-setup.ts' : undefined,
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // The first full-suite test pays the dev server's cold Turbopack compile of the (now larger)
  // app; the default 30s is tight for compile + sign-in popup, so give it generous headroom.
  // The retry still catches a genuine one-off; this stops the cold start from counting as flaky.
  timeout: 90_000,
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
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
