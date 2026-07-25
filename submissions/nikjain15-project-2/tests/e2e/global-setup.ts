import { chromium, type FullConfig } from '@playwright/test';

/**
 * Warm the dev server before the suite runs.
 *
 * The e2e webServer is `next dev` (Turbopack), which compiles each route lazily on first hit.
 * Without warming, whichever test runs first pays the full cold compile of /channels + its
 * client bundles (highly variable, occasionally >60s under load) and times out. Compiling the
 * routes once here — in a throwaway browser — means every real test starts against a warm server
 * and runs in a few seconds. Failures are swallowed: warming is best-effort, the tests are the
 * source of truth.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = (config.projects[0]?.use?.baseURL as string) ?? 'http://localhost:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(`${baseURL}/channels`, { timeout: 120_000, waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /continue with github/i }).waitFor({ timeout: 120_000 });
    await page.goto(`${baseURL}/home`, { timeout: 120_000, waitUntil: 'domcontentloaded' });
  } catch {
    // best-effort warm-up
  } finally {
    await browser.close();
  }
}
