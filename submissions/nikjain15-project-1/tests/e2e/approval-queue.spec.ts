import { expect, test, type Page } from '@playwright/test';
import { signUp, uniqueEmail } from './helpers';

/**
 * The 'ask_first' approval queue — DESIGN-SPEC §5.3 / §6.
 *
 * "Let it run, but ask me first" promises that nothing goes out under your name until you
 * say so. So a ship in ask_first mode posts its FACTS immediately but HOLDS the model's
 * sentence in `proposedNarrative` — shown only to you, on your Home, to Post or dismiss.
 *
 * A held proposal needs a narrated sentence, which needs ANTHROPIC_API_KEY (absent
 * locally). So the proposal is seeded through the emulator's REST API in the exact shape
 * the sync writes — `narrative: null`, `proposedNarrative` set. Every assertion below then
 * runs through the real UI as the real signed-in member, under the real rules: the half
 * that was never watched and the half that can break.
 */

const EMULATOR = 'http://127.0.0.1:8080/v1/projects/demo-pulse/databases/(default)/documents';

test.describe.configure({ timeout: 90_000 });

/** The uid of the just-signed-up member, by their email — the member doc exists after sign-up. */
async function uidByEmail(page: Page, email: string): Promise<string> {
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

/** A ship event with a HELD proposal — facts live, sentence pending. */
async function seedProposal(page: Page, uid: string, name: string, id: string, proposed: string) {
  const res = await page.request.post(`${EMULATOR}/pulse?documentId=${id}`, {
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    data: {
      fields: {
        kind: { stringValue: 'task_shipped' },
        actorUid: { stringValue: uid },
        actorName: { stringValue: name },
        actorPhotoURL: { nullValue: null },
        subject: { stringValue: 'Wire the approval queue' },
        projectId: { nullValue: null },
        taskId: { nullValue: null },
        narrative: { nullValue: null },
        proposedNarrative: { stringValue: proposed },
        evidence: {
          mapValue: {
            fields: {
              commits: { integerValue: '0' },
              prNumbers: { arrayValue: { values: [{ integerValue: '42' }] } },
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
  expect(res.ok(), 'proposal seed failed — is the emulator running?').toBeTruthy();
}

/** Read one pulse doc back, to assert what actually landed under the rules. */
async function readEvent(page: Page, id: string) {
  const res = await page.request.get(`${EMULATOR}/pulse/${id}`, {
    headers: { Authorization: 'Bearer owner' },
  });
  const body = (await res.json()) as { fields?: Record<string, { stringValue?: string; nullValue?: null }> };
  return {
    narrative: body.fields?.narrative?.stringValue ?? null,
    proposedNarrative: body.fields?.proposedNarrative?.stringValue ?? null,
  };
}

test.describe('ask_first — you approve before it posts', () => {
  test('a held proposal shows to you, with the facts, and is NOT yet a live narrative', async ({ page }) => {
    const email = uniqueEmail('queue');
    await signUp(page, 'Queue Probe', email);
    const uid = await uidByEmail(page, email);
    const id = `e2e_prop_show_${Date.now()}`;
    await seedProposal(page, uid, 'Queue Probe', id, 'Pulse wrote this and is waiting.');

    await page.goto('/');

    // Scope to the proposal section — the emulator's shared dataset means other seeded
    // events show their own PR receipts in the feed below.
    const proposal = page.locator('section').filter({ hasText: /Pulse wrote this about your work/i });
    await expect(proposal).toBeVisible();
    await expect(proposal.getByText('Pulse wrote this and is waiting.')).toBeVisible();
    // The facts published; the receipt is there.
    await expect(proposal.getByText('PR #42')).toBeVisible();
    // The controls are approve/dismiss, not the live post's edit/undo.
    await expect(proposal.getByRole('button', { name: /^post this$/i })).toBeVisible();
    await expect(proposal.getByText(/not this time/i)).toBeVisible();
  });

  test('Post this releases the exact sentence to the live feed', async ({ page }) => {
    const email = uniqueEmail('queue');
    await signUp(page, 'Queue Probe', email);
    const uid = await uidByEmail(page, email);
    const id = `e2e_prop_post_${Date.now()}`;
    await seedProposal(page, uid, 'Queue Probe', id, 'I shipped the approval queue.');

    await page.goto('/');
    await page.getByRole('button', { name: /^post this$/i }).click();

    // The row becomes a published receipt. Scope to the posted-row section — after
    // approval the same sentence correctly appears in the live feed below too, which is
    // the point (it's now public), so an unscoped match is legitimately ambiguous.
    const postedRow = page.locator('section').filter({ hasText: /pulse posted this/i });
    await expect(postedRow).toBeVisible();
    await expect(postedRow.getByText('I shipped the approval queue.')).toBeVisible();

    // And in the database, the sentence moved from proposal to narrative.
    const after = await readEvent(page, id);
    expect(after.narrative).toBe('I shipped the approval queue.');
    expect(after.proposedNarrative).toBeNull();
  });

  test('Not this time drops the sentence and keeps the facts', async ({ page }) => {
    const email = uniqueEmail('queue');
    await signUp(page, 'Queue Probe', email);
    const uid = await uidByEmail(page, email);
    const id = `e2e_prop_dismiss_${Date.now()}`;
    await seedProposal(page, uid, 'Queue Probe', id, 'This sentence gets declined.');

    await page.goto('/');
    await expect(page.getByText('This sentence gets declined.')).toBeVisible();
    await page.getByText(/not this time/i).click();

    // The proposal region is gone (no narrative, no proposal → nothing to show).
    await expect(page.getByText('This sentence gets declined.')).toHaveCount(0);

    // The event still exists with its facts; only the sentence was dropped. Poll the
    // server state — the dismiss write is async and may lag the optimistic UI update.
    await expect
      .poll(async () => (await readEvent(page, id)).proposedNarrative, { timeout: 5000 })
      .toBeNull();
    expect((await readEvent(page, id)).narrative).toBeNull();
  });
});
