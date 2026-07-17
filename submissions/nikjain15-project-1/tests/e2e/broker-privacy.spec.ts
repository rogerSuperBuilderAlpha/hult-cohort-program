import { expect, test, type Page } from '@playwright/test';
import { signUp, signOut, uniqueEmail, uniqueName } from './helpers';

/**
 * The Broker's inviolable asymmetry — LAYER-2-3-DESIGN.md, Layer 3. This spec is the
 * acceptance test the design demands: it must FAIL if any cohort-readable surface ever
 * exposes a stuck signal.
 *
 * With an introduction LIVE in the database (A stuck, B the one chosen helper):
 * - a third member sees NOTHING — no list, no count, no hint, not A's name in an ask;
 * - A themselves sees no flag — they receive help, never a diagnosis;
 * - the cohort feed carries no trace until help actually lands (intro_made is the one
 *   public moment, and it is a RESOLVED thank-you, not a stuck report).
 *
 * These assertions are deliberately written against the surfaces, not the rules — the
 * rules tests already prove the reads are denied; this proves no future UI change
 * renders a leak through a path the rules can't see (a server-fed prop, a derived
 * count, a "someone is struggling" hint computed client-side from public data).
 *
 * The seeding uses the emulator's owner bypass because clients cannot create
 * introductions — which is itself the point, and stays covered in tests/rules.
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

/** A live introduction, in exactly the shape the broker job will upsert. */
async function seedIntroduction(page: Page, id: string, stuckUid: string, helperUid: string) {
  const res = await page.request.post(`${EMULATOR}/introductions?documentId=${id}`, {
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    data: {
      fields: {
        stuckUid: { stringValue: stuckUid },
        helperUid: { stringValue: helperUid },
        recipeId: { nullValue: null },
        state: { stringValue: 'suggested' },
        createdAt: { timestampValue: new Date().toISOString().replace(/\.\d+/, '') },
      },
    },
  });
  expect(res.ok(), 'introduction seed failed — is the emulator running?').toBeTruthy();
}

/**
 * The words that would constitute a leak on a cohort surface. "stuck" appears in the
 * product's voice ONLY inside helper-only intros and the resolved "unstuck" thank-you —
 * so on a third member's screens, a bare "stuck on" (not "unstuck") is a failure, and
 * so is any "struggling"/"needs help" phrasing.
 */
const LEAKS = /\b(is stuck|stuck on|struggling|needs help|hasn.t pushed|days quiet|inactive)\b/i;

/** Every surface a signed-in cohort member can read. */
async function assertNoStuckSignal(page: Page, stuckName: string) {
  for (const path of ['/', '/board', '/projects', '/recipes']) {
    await page.goto(path);
    // Let the listeners settle so we assert against the real, populated surface.
    await page.getByRole('button', { name: 'sign out' }).waitFor();
    await page.waitForTimeout(500);

    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');

    const leak = text.match(LEAKS);
    expect(leak, `"${leak?.[0]}" leaked on ${path}`).toBeNull();

    // The stuck person's name may legitimately appear in public facts (their own
    // ships, their cards). What must never appear is their name inside an ask/nudge
    // block — Home's ask region is the only surface that nudges, so pin it directly.
    if (path === '/') {
      const askText = await page
        .locator('section')
        .filter({ hasText: /needs you|is stuck|Pick it up|solved/i })
        .allInnerTexts();
      for (const block of askText) {
        expect(
          block.includes(stuckName) && LEAKS.test(block),
          `ask block names ${stuckName} as stuck`
        ).toBe(false);
      }
    }
  }
}

test.describe('the asymmetry — a live intro is invisible to everyone but its helper', () => {
  test('a third member sees no stuck signal on any surface; the stuck person sees no flag; the feed carries no trace', async ({
    browser,
  }) => {
    const page = await browser.newPage();

    // Three real accounts through the real UI: A (stuck), B (helper), C (bystander).
    const a = { name: uniqueName('Stuck Probe'), email: uniqueEmail('priv-a') };
    const b = { name: uniqueName('Helper Probe'), email: uniqueEmail('priv-b') };
    const c = { name: uniqueName('Bystander Probe'), email: uniqueEmail('priv-c') };

    await signUp(page, a.name, a.email);
    const aUid = await uidForEmail(page, a.email);
    await signOut(page);
    await signUp(page, b.name, b.email);
    const bUid = await uidForEmail(page, b.email);
    await signOut(page);
    await signUp(page, c.name, c.email);

    await seedIntroduction(page, `e2e_priv_${Date.now()}`, aUid, bUid);

    // C — the cohort. Nothing, anywhere.
    await assertNoStuckSignal(page, a.name);

    // The feed specifically: no intro_made, no mention of the pairing — help hasn't
    // landed, so there is nothing to celebrate and nothing to report.
    await page.goto('/');
    const feed = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    expect(feed.includes('unstuck'), 'intro_made surfaced before help landed').toBe(false);

    // A — the person the intro describes. They see help arrive, never a flag; today,
    // with no help sent yet, they see exactly what any member sees: nothing.
    await signOut(page);
    const page2 = await browser.newPage();
    await page2.goto('/signin');
    await page2.getByPlaceholder('you@example.com').fill(a.email);
    await page2.getByPlaceholder('Password').fill('emulator-pw-123');
    await page2.getByRole('button', { name: 'Sign in' }).click();
    await page2.getByRole('button', { name: 'sign out' }).waitFor({ timeout: 15_000 });
    await assertNoStuckSignal(page2, a.name);

    await page.close();
    await page2.close();
  });
});
