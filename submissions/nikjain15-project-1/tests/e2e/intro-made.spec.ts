import { expect, test } from './fixtures';
import { signUp, uniqueEmail, uniqueName } from './helpers';

/**
 * The Broker's one public moment — LAYER-2-3-DESIGN.md, Layer 3.
 *
 * When help lands, an `intro_made` event reaches the cohort feed: "{actor} unstuck
 * {other} on {problem}". This is the ONLY time stuckness is ever public, and only because
 * it's now a resolved, positive story with the helped person's implied consent. The test
 * proves two things through the real feed: the sentence renders with its second party
 * (which used to be dropped because `PulseEvent` had no field for it), and it carries no
 * shame residue — no "stuck for N days", no count, no debt framing.
 *
 * The event is seeded with the emulator's owner token, which bypasses rules — exactly the
 * trusted server job's position (Admin SDK). A client CANNOT write one; that's covered in
 * the rules suite. Here we only assert how a legitimately-written one renders.
 */

const EMULATOR = `http://127.0.0.1:${process.env.FIRESTORE_EMULATOR_PORT ?? '8080'}/v1/projects/demo-pulse/databases/(default)/documents`;

test.describe.configure({ timeout: 90_000 });

test('an intro_made row reads as a resolved thank-you, naming both people and no shame', async ({ page }) => {
  const email = uniqueEmail('intro');
  await signUp(page, 'Helper Probe', email);

  const res = await page.request.get(`${EMULATOR}/members?pageSize=300`, {
    headers: { Authorization: 'Bearer owner' },
  });
  const body = (await res.json()) as {
    documents?: { fields: { uid: { stringValue: string }; email: { stringValue: string }; displayName?: { stringValue: string } } }[];
  };
  const me = body.documents!.find((d) => d.fields.email?.stringValue === email)!;
  const uid = me.fields.uid.stringValue;
  const myName = me.fields.displayName?.stringValue ?? 'Helper Probe';

  const problem = uniqueName('the OAuth redirect loop');
  const helped = uniqueName('Marcus');

  const seed = await page.request.post(`${EMULATOR}/pulse?documentId=intro_${Date.now()}`, {
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    data: { fields: {
      kind: { stringValue: 'intro_made' },
      actorUid: { stringValue: uid },
      actorName: { stringValue: myName },
      actorPhotoURL: { nullValue: null },
      subject: { stringValue: problem },
      otherUid: { stringValue: 'uid-marcus' },
      otherName: { stringValue: helped },
      projectId: { nullValue: null }, taskId: { nullValue: null },
      narrative: { nullValue: null }, proposedNarrative: { nullValue: null }, evidence: { nullValue: null },
      editedAt: { nullValue: null }, kudos: { arrayValue: { values: [] } },
      createdAt: { timestampValue: new Date().toISOString().replace(/\.\d+/, '') },
    } },
  });
  expect(seed.ok(), 'fixture seed failed — is the emulator running?').toBeTruthy();

  await page.goto('/');

  // The full sentence: helper, the helped person, the problem — all three.
  const row = page.getByText(new RegExp(`unstuck.*${helped}.*on`, 'i'));
  await expect(row).toBeVisible();
  await expect(page.getByText(helped)).toBeVisible();
  await expect(page.getByText(problem).first()).toBeVisible();

  // No shame residue: "unstuck" is the whole positive point, but nothing may frame the
  // helped person as having BEEN stuck, late, or behind — no duration, no debt.
  await expect(
    page.getByText(/stuck for|was stuck|is stuck|still stuck|days? (late|behind)|fell behind/i)
  ).toHaveCount(0);
});
