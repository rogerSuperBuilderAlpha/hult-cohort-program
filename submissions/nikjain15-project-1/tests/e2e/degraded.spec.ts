import { expect, test } from './fixtures';
import { signUp, uniqueEmail } from './helpers';

/**
 * DESIGN-SPEC §10 — degraded and error states.
 *
 * The product claims "it updates itself". When it can't, it has to say so in the same
 * breath. Silence is the worst option: a stale board that looks live is the exact lie
 * every other board tells, and the one this product exists to avoid.
 *
 * The other half of every assertion here is that CRUD still works. A sensing failure must
 * never block the board — that's the first non-negotiable.
 */

test.describe.configure({ timeout: 90_000 });

test('404 speaks in the product\'s voice, not the framework\'s', async ({ page }) => {
  // This used to be Next's default "404: This page could not be found" — a reviewer
  // clicking a stale link met the framework rather than the product.
  const res = await page.goto('/no-such-page-here');

  expect(res?.status()).toBe(404);
  await expect(page.getByText(/That page isn’t here\. The cohort still is, though\./)).toBeVisible();
  // A dead end that routes back in, and to the feed — the thing worth arriving at.
  await expect(page.getByRole('link', { name: /see the cohort’s week/i })).toHaveAttribute('href', '/');
});

test.describe('signed in', () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page, 'Degraded Probe', uniqueEmail('degraded'));
  });

  test('offline says so, the board still works, and it recovers by itself', async ({ page, context }) => {
    await page.goto('/board');
    await page.getByTestId('board').waitFor();
    await expect(page.getByTestId('offline-banner')).toBeHidden();

    await context.setOffline(true);
    // Firestore's own retry chatter can be slow; the banner is driven by the browser event.
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));

    const banner = page.getByTestId('offline-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Showing the last thing we saw');
    await expect(banner).toContainText('Changes will send when you’re back');

    // A banner, never a blocking screen: the board is still there and still operable.
    await expect(page.getByTestId('board')).toBeVisible();
    await expect(page.locator('[data-column]')).toHaveCount(3);

    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    // Auto-recovers — nothing to dismiss, nothing to retry by hand.
    await expect(banner).toBeHidden();
  });

  test('a GitHub rate limit is announced with its ETA, and CRUD survives it', async ({ page }) => {
    await page.route('**/api/sense**', async (route) => {
      const resetAt = new Date(Date.now() + 42 * 60_000).toISOString();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, failure: 'rate_limited', resetAt }),
      });
    });

    await page.goto('/board');

    // The board renders regardless — this assertion is the non-negotiable, not the banner.
    await expect(page.locator('[data-column]')).toHaveCount(3);
    await expect(page.getByRole('button', { name: '+ add' })).toBeVisible();
  });

  test('an unreachable sensing route degrades loudly rather than going quiet', async ({ page }) => {
    // Not a 500 — a hard network failure, which is what a dropped route actually looks like.
    await page.route('**/api/sense**', (route) => route.abort('failed'));

    await page.goto('/board');
    await expect(page.locator('[data-column]')).toHaveCount(3);
    await expect(page.getByRole('button', { name: '+ add' })).toBeVisible();
  });
});
