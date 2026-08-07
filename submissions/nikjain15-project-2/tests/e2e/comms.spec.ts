import { expect, test } from '@playwright/test';
import { signInWithGithubEmulator, waitForChannels } from './helpers';

/**
 * The signed-in comms flow, driven in a real browser against the emulator: sign in with GitHub
 * → land in the provisioned channels → post a message → see it appear. This exercises the whole
 * stack a person touches (auth, provisioning, firestore.rules, the realtime listener) end to
 * end — the browser-level complement to the integration tests.
 */
test('sign in, then send a message and see it appear', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  const body = `hello from e2e ${Date.now()}`;
  const composer = page.getByLabel('Message the channel');
  await composer.fill(body);
  await composer.press('Enter');

  await expect(page.getByText(body)).toBeVisible({ timeout: 15_000 });
});
