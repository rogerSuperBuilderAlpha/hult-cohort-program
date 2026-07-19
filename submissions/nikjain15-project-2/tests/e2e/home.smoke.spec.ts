import { expect, test } from '@playwright/test';

/**
 * Read-only smoke against Rally's DEPLOYED url — the checklist's definition of "it's live".
 * Never writes. The loop pairs this with the /api/health feature-probe, because a passing
 * smoke does NOT prove a FRESH deploy landed (memory pulse-deploy-mechanism).
 */
test('landing renders the value prop, the how-it-works loop, and a sign-in CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('in sync');
  await expect(page.getByText('How Rally works')).toBeVisible();
  for (const step of ['Talk', 'Recognize', 'Rise']) {
    await expect(page.locator('.rl-land-step b', { hasText: step })).toBeVisible();
  }
  await expect(page.getByRole('button', { name: 'Continue with GitHub' })).toBeVisible();
});

test('health route reports the Rally app shape', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.app).toBe('rally');
  expect(body.enrolled).toBe(65);
});
