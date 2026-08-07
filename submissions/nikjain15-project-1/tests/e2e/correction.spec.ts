import { expect, test, type Page } from './fixtures';
import { signUp, uniqueEmail, uniqueName } from './helpers';

/**
 * The correction flow — DESIGN-SPEC §6.1. Pulse posts without asking, so being wrong has
 * to be cheap.
 *
 * This is the trade the whole product rests on. There is no approve step by design: a
 * confirmation step is still an update step, and nobody updates Pulse. What buys that
 * autonomy is that the wording is one click from the post itself, undo is total, and the
 * evidence is on screen so a mistake is legible rather than mysterious.
 *
 * It went unverified for a long time because it can't be reached without a NARRATED event,
 * and narration needs ANTHROPIC_API_KEY, which correctly does not exist locally — every
 * local sync publishes facts only. So the event is seeded through the emulator's REST API,
 * in exactly the shape lib/sync.ts publishes on a ship. The seeding is a fixture; every
 * assertion below runs through the real UI as the real signed-in member, under the real
 * rules — which is the half that was never watched and the half that can break.
 */

const EMULATOR = `http://127.0.0.1:${process.env.FIRESTORE_EMULATOR_PORT ?? '8080'}/v1/projects/demo-pulse/databases/(default)/documents`;

/**
 * The receipt region, scoped.
 *
 * A narrated event renders TWICE on Home by design: once here as your receipt, and once in
 * the cohort feed below, because it is one event and both regions read the same list.
 * Unscoped text locators match both and fail strict mode — which is the test noticing the
 * design, not a duplicate to fix.
 */
const receipt = (page: Page) => page.locator('section').filter({ hasText: /pulse posted this/i }).first();

test.describe.configure({ timeout: 90_000 });

/**
 * The uid behind an email, read back from the database rather than guessed.
 *
 * `page.evaluate(() => import('firebase/auth'))` looks tidier and doesn't work: the page
 * has no bare-specifier resolution, so the import throws. Going through the member doc
 * the app itself just wrote is also a stronger check — it proves sign-up really landed.
 */
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

async function seedNarratedShip(
  page: Page,
  uid: string,
  id: string,
  narrative: string,
  kudosUids: string[] = []
) {
  // `owner` is the emulator's god token — it bypasses rules, which is right for a fixture
  // and wrong for anything asserted below.
  const res = await page.request.post(`${EMULATOR}/pulse?documentId=${id}`, {
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    data: {
      fields: {
        kind: { stringValue: 'task_shipped' },
        actorUid: { stringValue: uid },
        actorName: { stringValue: 'Correction Probe' },
        actorPhotoURL: { nullValue: null },
        subject: { stringValue: 'Wire up the sensor' },
        projectId: { nullValue: null },
        taskId: { nullValue: null },
        narrative: { stringValue: narrative },
        evidence: {
          mapValue: {
            fields: {
              commits: { integerValue: '0' },
              prNumbers: { arrayValue: { values: [{ integerValue: '40' }] } },
              files: { arrayValue: { values: [] } },
              spanHours: { nullValue: null },
            },
          },
        },
        editedAt: { nullValue: null },
        kudos: { arrayValue: { values: kudosUids.map((u) => ({ stringValue: u })) } },
        createdAt: { timestampValue: new Date().toISOString().replace(/\.\d+/, '') },
      },
    },
  });
  expect(res.ok(), 'fixture seed failed — is the emulator running?').toBeTruthy();
}

test.describe('the receipt you can correct', () => {
  test('renders as a receipt, not a form — no approve step', async ({ page }) => {
    const email = uniqueEmail('correct');
    await signUp(page, 'Correction Probe', email);
    const uid = await uidForEmail(page, email);
    const sentence = uniqueName('Pulse wrote this sentence.');
    await seedNarratedShip(page, uid, `e2e_render_${Date.now()}`, sentence);

    await page.goto('/');

    // Past tense, not a question. logPulse already fired at sync; this is a record.
    await expect(receipt(page)).toBeVisible();
    await expect(receipt(page).getByText(sentence)).toBeVisible();
    // The evidence rides with the claim — a legible mistake is forgivable.
    await expect(receipt(page).getByText('PR #40')).toBeVisible();

    // The absence is the assertion: approving is still updating, and nobody updates Pulse.
    await expect(receipt(page).getByRole('button', { name: /^(approve|confirm|publish|post)$/i })).toHaveCount(0);
  });

  test('the human rewords it, and the row says who did', async ({ page }) => {
    const email = uniqueEmail('correct');
    await signUp(page, 'Correction Probe', email);
    const uid = await uidForEmail(page, email);
    const wrong = uniqueName('Pulse got the wording wrong.');
    await seedNarratedShip(page, uid, `e2e_edit_${Date.now()}`, wrong);

    await page.goto('/');
    await page.getByRole('button', { name: /edit the wording/i }).click();

    // Scoped to the receipt: Home now also carries the Ask Pulse input, so an unscoped
    // textbox lookup is ambiguous. The reword editor lives in the posted-row receipt.
    const editor = receipt(page).getByRole('textbox');
    // Prefilled: correcting a sentence means editing it, not retyping it.
    await expect(editor).toHaveValue(wrong);

    const reworded = uniqueName('I reworded this myself.');
    await editor.fill(reworded);
    await page.getByRole('button', { name: /save my wording/i }).click();

    await expect(receipt(page).getByText(reworded)).toBeVisible();
    // Attribution stays honest in both directions: the human is right, AND Pulse still
    // admits it posted the original.
    await expect(receipt(page).getByText(/you reworded it/i)).toBeVisible();
    await expect(receipt(page).getByText(/pulse posted this/i)).toBeVisible();
  });

  test('your own kudos count is a receipt, never a dead button', async ({ page }) => {
    // The bug this pins: on your own row the kudos control was an inert heart that read as
    // a broken button — and in prod every row was the owner's own. It is now a plain count
    // of the recognition others gave you, with nothing pressable that can't be pressed.
    const email = uniqueEmail('correct');
    await signUp(page, 'Correction Probe', email);
    const uid = await uidForEmail(page, email);
    const sentence = uniqueName('Pulse wrote this too.');
    // A peer already gave it a kudos, so there is a count to render on the owner's row.
    await seedNarratedShip(page, uid, `e2e_kudos_${Date.now()}`, sentence, ['uid_a_peer']);

    await page.goto('/');
    await expect(receipt(page).getByText(sentence)).toBeVisible();

    // The count is there — shown plainly, no heart glyph to mistake for a control.
    const kudos = receipt(page).getByText(/\bkudos\b/);
    await expect(kudos).toBeVisible();

    // The heart of the fix: no kudos button on your own row, and the count is not inside
    // one. You cannot kudos yourself, so nothing here should look like you can.
    await expect(receipt(page).getByRole('button', { name: /kudos/i })).toHaveCount(0);
    await expect(kudos.locator('xpath=ancestor-or-self::button')).toHaveCount(0);
  });

  test('undo removes the post, with no argument', async ({ page }) => {
    const email = uniqueEmail('correct');
    await signUp(page, 'Correction Probe', email);
    const uid = await uidForEmail(page, email);
    const taken = uniqueName('This post gets taken back.');
    await seedNarratedShip(page, uid, `e2e_undo_${Date.now()}`, taken);

    await page.goto('/');
    await expect(receipt(page).getByText(taken)).toBeVisible();
    // In the cohort feed too — that's what makes undo worth testing rather than assuming.
    await expect(page.getByText(taken)).toHaveCount(2);

    await page.getByRole('button', { name: /^undo$/i }).click();

    // Total: gone from the receipt AND from the feed 64 other people read. An undo that
    // left the row in their feeds would make the promise a lie.
    await expect(page.getByText(taken)).toHaveCount(0);
    await expect(page.getByText(/pulse posted this/i)).toHaveCount(0);

    // Pulse never argues. No "are you sure?" — the human is right.
    await expect(page.getByText(/are you sure/i)).toHaveCount(0);
  });
});
