import { expect, test, type Page } from '@playwright/test';
import { signUp, uniqueEmail, uniqueName } from './helpers';

/**
 * Rung 1 of the ask ladder — the helper's private offer, driven through the real UI.
 * LAYER-2-3-DESIGN.md, Layer 3.
 *
 * The intro is seeded with the emulator's owner bypass (clients cannot create one — the
 * rules forbid it, and tests/rules prove that); everything asserted below runs as the
 * real signed-in helper under the real rules:
 * - the offer names the stuck person and their problem, and notes the banked recipe;
 * - Send marks it `sent` and lands on the recipe to hand over;
 * - "not now" dismisses — silent, terminal, gone after reload.
 *
 * Invisibility to everyone else is broker-privacy.spec.ts's job, and it stays green
 * with this UI live because the offer renders only from a query the rules scope to you.
 */

const EMULATOR = 'http://127.0.0.1:8080/v1/projects/demo-pulse/databases/(default)/documents';

test.describe.configure({ timeout: 120_000 });

async function uidForEmail(page: Page, email: string): Promise<string> {
  const res = await page.request.get(`${EMULATOR}/members?pageSize=300`, {
    headers: { Authorization: 'Bearer owner' },
  });
  const body = (await res.json()) as {
    documents?: { fields: { uid: { stringValue: string }; email: { stringValue: string } } }[];
  };
  const match = body.documents?.find((d) => d.fields.email?.stringValue === email);
  expect(match, `no member doc for ${email}`).toBeTruthy();
  return match!.fields.uid.stringValue;
}

async function seedRecipe(page: Page, id: string, authorUid: string, problem: string) {
  const res = await page.request.post(`${EMULATOR}/recipes?documentId=${id}`, {
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    data: {
      fields: {
        problem: { stringValue: problem },
        body: { stringValue: '1. The fix that worked.' },
        authorUid: { stringValue: authorUid },
        taskId: { nullValue: null },
        turns: { integerValue: '3' },
        unstuckUids: { arrayValue: { values: [] } },
        createdAt: { timestampValue: new Date().toISOString().replace(/\.\d+/, '') },
      },
    },
  });
  expect(res.ok(), 'recipe seed failed').toBeTruthy();
}

async function seedIntro(
  page: Page,
  id: string,
  args: { stuckUid: string; helperUid: string; recipeId: string | null; problem: string }
) {
  const res = await page.request.post(`${EMULATOR}/introductions?documentId=${id}`, {
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    data: {
      fields: {
        stuckUid: { stringValue: args.stuckUid },
        helperUid: { stringValue: args.helperUid },
        recipeId: args.recipeId ? { stringValue: args.recipeId } : { nullValue: null },
        problem: { stringValue: args.problem },
        state: { stringValue: 'suggested' },
        createdAt: { timestampValue: new Date().toISOString().replace(/\.\d+/, '') },
      },
    },
  });
  expect(res.ok(), 'intro seed failed').toBeTruthy();
}

async function introState(page: Page, id: string): Promise<string | null> {
  const res = await page.request.get(`${EMULATOR}/introductions/${id}`, {
    headers: { Authorization: 'Bearer owner' },
  });
  const body = (await res.json()) as { fields?: { state?: { stringValue?: string } } };
  return body.fields?.state?.stringValue ?? null;
}

/** Sign up the stuck member (so their name resolves), then the helper, leaving the
 * helper signed in. */
async function twoMembers(page: Page) {
  const stuck = { name: uniqueName('Stuck Marcus'), email: uniqueEmail('intro-stuck') };
  await signUp(page, stuck.name, stuck.email);
  const stuckUid = await uidForEmail(page, stuck.email);
  await page.getByRole('button', { name: 'sign out' }).click();
  await page.waitForURL(/\/signin/);

  const helper = { name: uniqueName('Helper Ada'), email: uniqueEmail('intro-helper') };
  await signUp(page, helper.name, helper.email);
  const helperUid = await uidForEmail(page, helper.email);
  return { stuck, stuckUid, helper, helperUid };
}

test.describe('rung 1 — the helper offer', () => {
  test('shows to the helper with the stuck person\'s name; Send marks sent and lands on the recipe', async ({ page }) => {
    const { stuck, stuckUid, helperUid } = await twoMembers(page);
    const problem = uniqueName('OAuth redirect loops after login');
    const recipeId = `e2e_intro_recipe_${Date.now()}`;
    await seedRecipe(page, recipeId, helperUid, problem);
    const introId = `e2e_intro_send_${Date.now()}`;
    await seedIntro(page, introId, { stuckUid, helperUid, recipeId, problem });

    await page.goto('/');
    const rung = page.locator('section').filter({ hasText: /is stuck on something you solved/ });
    await expect(rung).toBeVisible();
    // The name appears in the headline AND the send button — assert the headline role.
    await expect(rung.getByRole('heading', { name: new RegExp(stuck.name) })).toBeVisible();
    await expect(rung.getByText(problem)).toBeVisible();
    await expect(rung.getByText('You banked a recipe for this.')).toBeVisible();

    await rung.getByRole('button', { name: /what worked$/ }).click();

    // Sending lands on the recipe — the thing to actually hand over.
    await expect(page).toHaveURL(new RegExp(`/recipes/${recipeId}`));
    await expect.poll(() => introState(page, introId)).toBe('sent');

    // Back on Home the rung is gone: a sent intro is no longer live.
    await page.goto('/');
    await expect(page.getByText('The cohort’s week')).toBeVisible();
    await expect(page.locator('section').filter({ hasText: /is stuck on something you solved/ })).toHaveCount(0);
  });

  test('"not now" dismisses — silent, terminal, gone after reload', async ({ page }) => {
    const { stuckUid, helperUid } = await twoMembers(page);
    const problem = uniqueName('The emulator ate a listener');
    const introId = `e2e_intro_dismiss_${Date.now()}`;
    await seedIntro(page, introId, { stuckUid, helperUid, recipeId: null, problem });

    await page.goto('/');
    const rung = page.locator('section').filter({ hasText: /is stuck on something you solved/ });
    await expect(rung).toBeVisible();
    // No recipe on this intro — the offer stands, without the recipe note.
    await expect(rung.getByText('You banked a recipe for this.')).toHaveCount(0);

    await rung.getByRole('button', { name: 'not now' }).click();
    await expect(page.locator('section').filter({ hasText: /is stuck on something you solved/ })).toHaveCount(0);
    await expect.poll(() => introState(page, introId)).toBe('dismissed');

    await page.reload();
    await expect(page.getByText('The cohort’s week')).toBeVisible();
    await expect(page.locator('section').filter({ hasText: /is stuck on something you solved/ })).toHaveCount(0);
  });
});
