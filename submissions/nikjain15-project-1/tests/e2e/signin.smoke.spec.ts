import { expect, test } from '@playwright/test';

/**
 * Smoke — runs against the DEPLOYED url on every gate.
 *
 * Deliberately tiny. Vercel's DDoS mitigation challenges bots that poll one deployment
 * hard from a single IP, so the smoke suite checks that the app is up and honest, and
 * leaves the deep flows to the full suite.
 */

test('the deployed app serves a real sign-in page over HTTPS', async ({ page }) => {
  const response = await page.goto('/signin');

  expect(response?.status()).toBe(200);
  expect(page.url()).toMatch(/^https:\/\//);

  // Both auth paths must be reachable: GitHub is the sensor, email/password is the
  // fallback for anyone who won't connect a repo (and B3 grades it).
  await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test('registration is open — the sign-up path is reachable without an invite', async ({ page }) => {
  await page.goto('/signin');

  // B1 requires all 65 accounts to work with no allowlist and no manual DB edits.
  // If this control disappears, registration has quietly closed. A button, not a link:
  // "Create an account" toggles the form in place rather than navigating, so button is
  // the correct role — the old link-only locator failed against the real page.
  await expect(
    page
      .getByRole('button', { name: /create an account|sign up/i })
      .or(page.getByRole('link', { name: /create an account|sign up/i }))
  ).toBeVisible();
});

test('no server-side secret reaches the browser bundle', async ({ page }) => {
  const scripts: string[] = [];

  page.on('response', async (response) => {
    if (!response.url().endsWith('.js')) return;
    if (response.status() !== 200) return;
    try {
      scripts.push(await response.text());
    } catch {
      // A bundle that won't decode can't be asserted on; the others still cover us.
    }
  });

  await page.goto('/signin');
  await page.waitForLoadState('networkidle');

  const bundle = scripts.join('\n');
  expect(scripts.length).toBeGreaterThan(0);

  // NEXT_PUBLIC_* is meant to ship. These are not.
  expect(bundle).not.toContain('sk-ant-');
  expect(bundle).not.toContain('ghp_');
  expect(bundle).not.toMatch(/ANTHROPIC_API_KEY\s*[:=]\s*["'][^"']+["']/);
});
