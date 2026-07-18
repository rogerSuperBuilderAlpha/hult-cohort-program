import { expect, test, type Page } from '@playwright/test';
import { signUp, uniqueEmail, uniqueName } from './helpers';

/**
 * The recipe offer — LAYER-2-3-DESIGN.md, Layer 2. "That one took a while. Keep what
 * worked?" appears once, on Home, to the person who just won a hard fight — and never to
 * anyone else, never twice for the same work, never for a trivial ship.
 *
 * Three promises run through the real UI here:
 * - **The offer fires on a hard ship, and pre-fills the modal from the draft.** "Draft it
 *   for me" calls /api/extract-recipe; the human edits and taps Bank it, and the banked
 *   recipe links back to the shipped card so the feed's recipe chip points at it.
 * - **One offer, dismissible, never repeated.** "not now" tombstones it; a reload doesn't
 *   bring it back. Banking it retires it too.
 * - **Never nag.** A ship whose evidence shows no fight gets no offer at all — silence is
 *   the honest default, and pressuring people to bank is exactly what the design forbids.
 *
 * The extraction route reaches GitHub + Anthropic, neither of which exists in e2e, so the
 * route is mocked per-test: the draft's *content* isn't under test here (extract.test.ts
 * owns that), the flow around it is. The seeding is a fixture; every assertion runs
 * through the real signed-in UI under the real rules.
 */

const EMULATOR = 'http://127.0.0.1:8080/v1/projects/demo-pulse/databases/(default)/documents';

const offer = (page: Page) =>
  page.locator('section').filter({ hasText: /took a while\. Keep what worked/i });

test.describe.configure({ timeout: 90_000 });

async function uidForEmail(page: Page, email: string): Promise<string> {
  const res = await page.request.get(`${EMULATOR}/members?pageSize=300`, {
    headers: { Authorization: 'Bearer owner' },
  });
  const body = (await res.json()) as {
    documents?: { fields: { uid: { stringValue: string }; email: { stringValue: string } } }[];
  };
  const match = body.documents?.find((d) => d.fields.email?.stringValue === email);
  expect(match, `no member doc for ${email} — did sign-up land?`).toBeTruthy();
  return match!.fields.uid.stringValue;
}

/**
 * Seed a shipped event in exactly the shape lib/sync.ts publishes, with tunable evidence
 * so a test can make it look like a fight or a trivial ship. `owner` is the emulator's god
 * token — right for a fixture, wrong for anything asserted below.
 */
async function seedShip(
  page: Page,
  args: { uid: string; id: string; subject: string; taskId: string; commits: number; prNumber: number }
) {
  const res = await page.request.post(`${EMULATOR}/pulse?documentId=${args.id}`, {
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    data: {
      fields: {
        kind: { stringValue: 'task_shipped' },
        actorUid: { stringValue: args.uid },
        actorName: { stringValue: 'Offer Probe' },
        actorPhotoURL: { nullValue: null },
        subject: { stringValue: args.subject },
        projectId: { nullValue: null },
        taskId: { stringValue: args.taskId },
        narrative: { nullValue: null },
        evidence: {
          mapValue: {
            fields: {
              commits: { integerValue: String(args.commits) },
              prNumbers: { arrayValue: { values: [{ integerValue: String(args.prNumber) }] } },
              files: { arrayValue: { values: [] } },
              spanHours: { nullValue: null },
            },
          },
        },
        editedAt: { nullValue: null },
        kudos: { arrayValue: { values: [] } },
        createdAt: { timestampValue: new Date().toISOString().replace(/\.\d+/, '') },
      },
    },
  });
  expect(res.ok(), 'fixture seed failed — is the emulator running?').toBeTruthy();
}

test.describe('the offer at the moment of relief', () => {
  test('a hard ship offers a draft, pre-fills the modal, and the banked recipe links back', async ({ page }) => {
    const email = uniqueEmail('offer');
    await signUp(page, 'Offer Probe', email);
    const uid = await uidForEmail(page, email);

    const taskId = `e2e_task_${Date.now()}`;
    const subject = uniqueName('Fix the OAuth redirect loop');
    // 8 commits ≥ FIGHT_COMMITS(6): unambiguously a fight.
    await seedShip(page, { uid, id: `e2e_offer_${Date.now()}`, subject, taskId, commits: 8, prNumber: 41 });

    // The draft the route would return — mocked so the test doesn't reach GitHub/Anthropic.
    const draftProblem = uniqueName('OAuth redirect looped after login');
    await page.route('**/api/extract-recipe', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ thin: false, problem: draftProblem, body: '1. Removed the trailing slash' }),
      });
    });

    await page.goto('/');

    // The offer names the work, and only the actor sees it about their own ship.
    await expect(offer(page)).toBeVisible();
    await expect(offer(page).getByText(subject)).toBeVisible();

    await offer(page).getByRole('button', { name: /draft it for me/i }).click();

    // Pre-filled from the draft — the human edits, they don't retype.
    const modal = page.getByRole('dialog');
    await expect(modal.getByLabel('The problem')).toHaveValue(draftProblem);
    await expect(modal.getByLabel('What worked')).toHaveValue('1. Removed the trailing slash');

    await modal.getByRole('button', { name: /bank it/i }).click();

    // Banked → the offer retires for this work, and the shipped row now carries the recipe
    // chip because the recipe's taskId links back to the card.
    await expect(offer(page)).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^recipe$/i }).first()).toBeVisible();

    // The retirement survives a reload — banking is a real tombstone, not a render trick.
    await page.reload();
    await expect(offer(page)).toHaveCount(0);
  });

  test('"not now" dismisses the offer for good — one ask, once', async ({ page }) => {
    const email = uniqueEmail('offer');
    await signUp(page, 'Offer Probe', email);
    const uid = await uidForEmail(page, email);

    const subject = uniqueName('Untangle the sync race');
    await seedShip(page, {
      uid,
      id: `e2e_dismiss_${Date.now()}`,
      subject,
      taskId: `e2e_task_${Date.now()}`,
      commits: 9,
      prNumber: 42,
    });

    await page.goto('/');
    await expect(offer(page)).toBeVisible();

    await offer(page).getByRole('button', { name: /not now/i }).click();
    await expect(offer(page)).toHaveCount(0);

    // Gone for good: a reload does not resurrect a dismissed offer.
    await page.reload();
    await expect(offer(page)).toHaveCount(0);
  });

  test('a trivial ship gets no offer — never nag', async ({ page }) => {
    const email = uniqueEmail('offer');
    await signUp(page, 'Offer Probe', email);
    const uid = await uidForEmail(page, email);

    const subject = uniqueName('Bump a version number');
    // 1 commit, no span: no evidence of a fight → no claim there was one.
    await seedShip(page, {
      uid,
      id: `e2e_trivial_${Date.now()}`,
      subject,
      taskId: `e2e_task_${Date.now()}`,
      commits: 1,
      prNumber: 43,
    });

    await page.goto('/');
    // The row is in the feed — but no offer above it. Silence is the honest default.
    await expect(page.getByText(subject).first()).toBeVisible();
    await expect(offer(page)).toHaveCount(0);
  });
});
