import { expect, test } from '@playwright/test';
import { signInWithGithubEmulator, waitForChannels } from './helpers';

/**
 * Realtime across TWO independent clients — the check Pulse's standard insists on ("two contexts
 * side by side"). Two separate browser contexts (two signed-in members) both open #general; one
 * posts, the other sees it appear live via the onSnapshot listener, with no reload. This is the
 * strongest proof that Firestore-as-the-realtime-bus actually fans out to other people's screens.
 */
test('a message from one client appears live on another', async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();

  try {
    for (const page of [a, b]) {
      await page.goto('/channels');
      await signInWithGithubEmulator(page);
      await waitForChannels(page);
    }

    // A posts; B must see it without reloading.
    const body = `realtime ${Date.now()}`;
    const composerA = a.getByLabel('Message the channel');
    await composerA.fill(body);
    await composerA.press('Enter');

    await expect(a.getByText(body)).toBeVisible({ timeout: 15_000 });
    await expect(b.getByText(body)).toBeVisible({ timeout: 15_000 });
  } finally {
    await ctxA.close();
    await ctxB.close();
  }
});
