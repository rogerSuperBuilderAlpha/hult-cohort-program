import { expect, test } from './fixtures';
import { createProject, createTask, signUp, uniqueEmail, uniqueName } from './helpers';

/**
 * C6 — a card pulses when it LANDS in done, however it got there.
 *
 * The bug this pins: the celebration used to fire inside the drag/select handler, so the
 * only completion that marked itself was one you performed by hand. Pulse's whole claim is
 * that you don't move the cards — a merged PR sliding a card into done, or a teammate
 * finishing something while you watch, did it in silence. The best beat in the product was
 * the one it didn't mark.
 *
 * A peer's move is the honest test of that. It arrives exactly the way a sensed ship does —
 * as a status change on a snapshot, with no local interaction — so it proves the mechanism
 * without needing GitHub. Against the old code this test fails: browser B saw the card
 * arrive in done and did nothing.
 */

test.describe.configure({ timeout: 90_000 });

const PULSE_CLASS = '.motion-safe\\:animate-\\[pulse-once_600ms_ease-out\\]';

test('a card someone ELSE ships pulses on your board, with no reload', async ({ browser }) => {
  const project = uniqueName('Celebrate');
  const title = uniqueName('Celebrate card');

  const alice = await browser.newContext();
  const alicePage = await alice.newPage();
  await signUp(alicePage, 'Celebrate Alice', uniqueEmail('celebrate-a'));
  await createProject(alicePage, project);
  await createTask(alicePage, title, { project });

  // Bob watches the same cohort board. He never touches the card.
  const bob = await browser.newContext();
  const bobPage = await bob.newPage();
  await signUp(bobPage, 'Celebrate Bob', uniqueEmail('celebrate-b'));
  await bobPage.goto('/board');
  await bobPage.getByTestId('board').waitFor();
  await expect(bobPage.getByRole('heading', { name: title })).toBeVisible({ timeout: 15_000 });

  // The pulse lasts 600ms, so watch for it rather than sampling after the fact.
  await bobPage.evaluate((cls) => {
    (window as unknown as { __pulsed: string[] }).__pulsed = [];
    const seen = (window as unknown as { __pulsed: string[] }).__pulsed;
    setInterval(() => {
      document.querySelectorAll(cls).forEach((el) => {
        const text = (el as HTMLElement).innerText.split('\n')[0];
        if (text && !seen.includes(text)) seen.push(text);
      });
    }, 60);
  }, PULSE_CLASS);

  // Alice ships it, in her own browser.
  await alicePage.goto('/board');
  const card = alicePage.getByRole('heading', { name: title }).locator('..').locator('..');
  await card.getByRole('combobox').selectOption('done');

  // Bob's board moves without a reload (C4) — and marks it (C6).
  await expect(async () => {
    const pulsed = await bobPage.evaluate(() => (window as unknown as { __pulsed: string[] }).__pulsed);
    expect(pulsed.some((t) => t.includes(title))).toBe(true);
  }).toPass({ timeout: 15_000 });

  await alice.close();
  await bob.close();
});

test('a page load does NOT celebrate cards that were already done', async ({ page }) => {
  // Otherwise every refresh throws confetti at last week's work, which would make the
  // signal meaningless — it marks a transition you witnessed, not a state.
  const project = uniqueName('NoConfetti');
  const title = uniqueName('Already done');

  await signUp(page, 'No Confetti', uniqueEmail('noconfetti'));
  await createProject(page, project);
  await createTask(page, title, { project });

  await page.goto('/board');
  const card = page.getByRole('heading', { name: title }).locator('..').locator('..');
  await card.getByRole('combobox').selectOption('done');
  await expect(page.locator('[data-column="done"]').getByRole('heading', { name: title })).toBeVisible();

  // Reload: the card is in done from the first paint, so nothing should pulse.
  await page.reload();
  await page.getByTestId('board').waitFor();
  await expect(page.locator(PULSE_CLASS)).toHaveCount(0);
});
