import { expect, test } from '@playwright/test';
import { signInWithGithubEmulator, waitForChannels } from './helpers';

/**
 * Per-feature browser coverage beyond the base send-a-message flow: reacting to a message, and
 * the Home situation board rendering its bands. Real signed-in path against the emulator.
 */

test('react to a message and see the count, then remove it', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  const body = `react target ${Date.now()}`;
  const composer = page.getByLabel('Message the channel');
  await composer.fill(body);
  await composer.press('Enter');
  await expect(page.getByText(body)).toBeVisible({ timeout: 15_000 });

  // Open the emoji picker on that message and pick 🎉.
  const row = page.locator('.rl-msgrow', { hasText: body });
  await row.getByRole('button', { name: 'Add reaction' }).click();
  await page.getByRole('button', { name: '🎉', exact: true }).click();

  // The reaction pill (emoji + count) appears and is mine (toggle it off again).
  const pill = row.getByRole('button', { name: /🎉 1/ });
  await expect(pill).toBeVisible({ timeout: 10_000 });
  await pill.click();
  await expect(row.getByRole('button', { name: /🎉 1/ })).toHaveCount(0, { timeout: 10_000 });
});

test('track a commitment from a message and see it on Home', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  // A first-person promise triggers the inline "Track it" affordance on your own message.
  const promise = `I'll open the PR by Friday ${Date.now()}`;
  const composer = page.getByLabel('Message the channel');
  await composer.fill(promise);
  await composer.press('Enter');
  await expect(page.getByText(promise)).toBeVisible({ timeout: 15_000 });

  const row = page.locator('.rl-msgrow', { hasText: promise });
  await row.getByRole('button', { name: 'Track it' }).click();
  await expect(row.getByText('Tracked ✓')).toBeVisible({ timeout: 10_000 });

  // It shows up under Home → "You promised" (recorded even with no PM adapter configured).
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByText('You promised')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(promise)).toBeVisible();
});

test('@mention autocomplete suggests a channel member and inserts them', async ({ browser }) => {
  const ctxA = await browser.newContext();
  const ctxB = await browser.newContext();
  const a = await ctxA.newPage();
  const b = await ctxB.newPage();
  try {
    await a.goto('/channels');
    await signInWithGithubEmulator(a);
    await waitForChannels(a);
    const aName = ((await a.locator('.rl-me b').first().textContent()) ?? '').trim();
    expect(aName.length).toBeGreaterThan(0);

    await b.goto('/channels');
    await signInWithGithubEmulator(b);
    await waitForChannels(b);

    // B types "@" + a prefix of A's name; the dropdown suggests A; picking inserts "@A ".
    const composer = b.getByLabel('Message the channel');
    await composer.click();
    await composer.fill(`@${aName.slice(0, 4)}`);
    const option = b.getByRole('option', { name: aName });
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
    await expect(composer).toHaveValue(`@${aName} `);
  } finally {
    await ctxA.close();
    await ctxB.close();
  }
});

test('edit your display name on the profile screen', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  // Reach profile via the "me" footer link in the nav.
  await page.getByRole('link', { name: 'Profile and settings' }).click();
  await expect(page).toHaveURL(/\/profile$/);

  const nameBox = page.getByLabel('Display name');
  const newName = `Renamed ${Date.now()}`;
  await nameBox.fill(newName);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Saved ✓')).toBeVisible({ timeout: 10_000 });

  // The new name propagates to the nav footer (same profiles listener).
  await expect(page.locator('.rl-me').getByText(newName)).toBeVisible({ timeout: 10_000 });
});

test('react to a message inside a thread', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  const parent = `thread parent ${Date.now()}`;
  const composer = page.getByLabel('Message the channel');
  await composer.fill(parent);
  await composer.press('Enter');
  await expect(page.getByText(parent)).toBeVisible({ timeout: 15_000 });

  // Open the thread and post a reply.
  await page.locator('.rl-msgrow', { hasText: parent }).getByRole('button', { name: 'Reply' }).click();
  const replyBox = page.getByLabel('Reply to thread');
  const reply = `thread reply ${Date.now()}`;
  await replyBox.fill(reply);
  await replyBox.press('Enter');
  await expect(page.getByText(reply)).toBeVisible({ timeout: 10_000 });

  // React to the reply — the reaction pill appears on it.
  const replyRow = page.locator('.rl-msg', { hasText: reply });
  await replyRow.getByRole('button', { name: 'Add reaction' }).click();
  await page.getByRole('button', { name: '🎉', exact: true }).click();
  await expect(replyRow.getByRole('button', { name: /🎉 1/ })).toBeVisible({ timeout: 10_000 });
});

test('search filters the channel to matching messages', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  const stamp = Date.now();
  const needle = `pineapple${stamp}`;
  const other = `banana${stamp}`;
  const composer = page.getByLabel('Message the channel');
  await composer.fill(needle);
  await composer.press('Enter');
  await expect(page.locator('.rl-msgrow', { hasText: needle })).toBeVisible({ timeout: 15_000 });
  await composer.fill(other);
  await composer.press('Enter');
  await expect(page.locator('.rl-msgrow', { hasText: other })).toBeVisible({ timeout: 10_000 });

  // Open search and query the needle — only its row remains, and the match is highlighted.
  await page.getByRole('button', { name: 'Search messages' }).click();
  await page.getByLabel('Search messages in channel').fill(needle);
  await expect(page.locator('.rl-msgrow', { hasText: other })).toHaveCount(0, { timeout: 10_000 });
  await expect(page.locator('.rl-msgrow', { hasText: needle })).toBeVisible();
  await expect(page.locator('.rl-msgrow mark.rl-hit', { hasText: needle })).toBeVisible();
});

test('edit then delete your own message', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  const body = `editable ${Date.now()}`;
  const composer = page.getByLabel('Message the channel');
  await composer.fill(body);
  await composer.press('Enter');
  await expect(page.getByText(body)).toBeVisible({ timeout: 15_000 });

  // Edit it: the author sees an Edit control; the edited body + "(edited)" marker appear.
  const row = page.locator('.rl-msgrow', { hasText: body });
  await row.getByRole('button', { name: 'Edit message' }).click();
  const editBox = page.getByLabel('Edit message');
  const edited = `${body} — revised`;
  await editBox.fill(edited);
  await editBox.press('Enter');
  await expect(page.getByText(edited)).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('.rl-msgrow', { hasText: edited }).getByText('(edited)')).toBeVisible();

  // Delete it: accept the confirm, the message is gone.
  page.on('dialog', (d) => d.accept());
  await page.locator('.rl-msgrow', { hasText: edited }).getByRole('button', { name: 'Delete message' }).click();
  await expect(page.getByText(edited)).toHaveCount(0, { timeout: 10_000 });
});

test('Ask Rally is reachable on a narrow screen where the rail is hidden', async ({ page }) => {
  // Below 1024px the right rail (which holds the Ask Rally card) is display:none. The header
  // "Ask Rally" control must still open it in a modal so the intelligence stays reachable.
  await page.setViewportSize({ width: 800, height: 900 });
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  // The rail is hidden at this width; its Ask Rally input is not visible.
  await expect(page.locator('.rl-rail')).toBeHidden();

  await page.getByRole('button', { name: 'Open Ask Rally' }).click();
  // The rail also holds an (offscreen, display:none) copy of the input; the modal copy is the
  // last one in the DOM and the only visible one.
  await expect(page.getByLabel('Ask Rally about this channel').last()).toBeVisible({ timeout: 10_000 });
});

test('leaderboard full-board opt-in toggles and persists', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);
  await page.getByRole('link', { name: 'Leaderboard' }).click();
  await expect(page).toHaveURL(/\/leaderboard$/);

  // Default is neighbors-only: the opt-in control offers to reveal the leaders.
  const toggle = page.getByRole('button', { name: 'Show cohort leaders' });
  await expect(toggle).toBeVisible({ timeout: 15_000 });
  await toggle.click();
  // Now opted in — control flips, and the preference survives a reload.
  await expect(page.getByRole('button', { name: 'Hide leaders' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Hide leaders' })).toBeVisible({ timeout: 15_000 });
});

test('first-time onboarding shows once, then stays dismissed', async ({ page }) => {
  // A fresh context has empty localStorage, so the welcome should appear on Home.
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);
  await page.getByRole('link', { name: 'Home' }).click();

  const dialog = page.getByRole('dialog', { name: 'Welcome to Rally' });
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: "Let's go" }).click();
  await expect(dialog).toBeHidden();

  // The flag persists — it does not nag on a return visit.
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Welcome to Rally' })).toHaveCount(0, { timeout: 10_000 });
});

test('the Rally assistant panel renders on Home', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);
  await page.getByRole('link', { name: 'Home' }).click();

  // The assistant mounts with its input and starter prompts (no message sent — avoids a live call).
  await expect(page.getByText('Rally · your assistant')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByLabel('Ask Rally', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Catch me up' })).toBeVisible();
});

test('the Home situation board renders its bands', async ({ page }) => {
  await page.goto('/channels');
  await signInWithGithubEmulator(page);
  await waitForChannels(page);

  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL(/\/home$/);

  // Recognition-first situation board: the three named bands + the Catch me up brief render.
  await expect(page.locator('.rl-band', { hasText: "You're winning" })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.rl-band', { hasText: 'Caught up' })).toBeVisible();
  await expect(page.locator('.rl-band', { hasText: 'Building together' })).toBeVisible();
  await expect(page.locator('.rl-k', { hasText: 'Catch me up' })).toBeVisible();
});
