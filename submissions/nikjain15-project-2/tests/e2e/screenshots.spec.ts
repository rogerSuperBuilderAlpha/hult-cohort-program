import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { signInWithGithubEmulator, waitForChannels } from './helpers';

/**
 * Capture product screenshots for the docs (rally-specs/images/). Emulator-only — it signs up a
 * synthetic account and drives the real signed-in UI, so it may never run against prod (the
 * playwright config already refuses a non-local destructive run). Not a regression test; run it on
 * demand to refresh the images in ARCHITECTURE.md:
 *   npm run screenshots
 */
const OUT = 'rally-specs/images';

test('capture product screenshots', async ({ page }) => {
  mkdirSync(OUT, { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto('/channels', { waitUntil: 'domcontentloaded' });
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  // Dismiss the first-run onboarding modal so it doesn't cover the screens.
  const letsGo = page.getByRole('button', { name: /let'?s go/i });
  if (await letsGo.count()) await letsGo.first().click().catch(() => {});
  await page.waitForTimeout(400);

  // Post a couple of messages so the channel view isn't empty.
  const composer = page.getByPlaceholder(/message/i).first();
  if (await composer.count()) {
    for (const line of ['morning all — kicking off the auth refactor 👋', 'anyone free to pair on the webhook handler?']) {
      await composer.fill(line);
      await composer.press('Enter');
      await page.waitForTimeout(400);
    }
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/channels.png`, fullPage: false });

  await page.goto('/home', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const letsGo2 = page.getByRole('button', { name: /let'?s go/i });
  if (await letsGo2.count()) await letsGo2.first().click().catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/home.png`, fullPage: false });

  await page.goto('/leaderboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/leaderboard.png`, fullPage: false });

  await page.goto('/quests', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/quests.png`, fullPage: false });
});
