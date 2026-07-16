import { defineConfig, devices } from '@playwright/test';

// Playwright runs against the DEPLOYED url by default, not a local dev server.
// That is the checklist's definition of done: "driven in a real browser against the
// deployed URL, as a peer reviewer would". Override with BASE_URL to point at localhost.
const BASE_URL = process.env.BASE_URL ?? 'https://pm-nikjain15.vercel.app';

export default defineConfig({
  testDir: 'tests/e2e',
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
