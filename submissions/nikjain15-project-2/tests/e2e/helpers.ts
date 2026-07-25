import { expect, type Page } from '@playwright/test';

/**
 * Sign in through the Firebase Auth emulator's GitHub popup.
 *
 * The app only ever offers GitHub sign-in (no test backdoor in product code). Against the Auth
 * emulator, signInWithPopup opens the emulator's IdP widget, where we "add a new account" and
 * auto-generate its details. This drives the REAL sign-in path a person uses — the only thing
 * swapped out is GitHub itself, which the emulator stands in for.
 */
export async function signInWithGithubEmulator(page: Page): Promise<void> {
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: /continue with github/i }).click(),
  ]);
  await popup.waitForLoadState('domcontentloaded');

  // Fresh emulator account picker → "Add new account".
  const addNew = popup.getByRole('button', { name: /add new account/i });
  if (await addNew.count()) await addNew.first().click();

  // Auto-generate the account's user information, if the widget offers it.
  const autoGen = popup.getByRole('button', { name: /auto.?generate user information/i });
  if (await autoGen.count()) await autoGen.first().click();

  // Complete the sign-in.
  await popup.getByRole('button', { name: /sign in with github/i }).first().click();
  await popup.waitForEvent('close').catch(() => {});
}

/** Wait until the signed-in comms UI is ready (default channels provisioned). */
export async function waitForChannels(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: /# general/i })).toBeVisible({ timeout: 20_000 });
}
