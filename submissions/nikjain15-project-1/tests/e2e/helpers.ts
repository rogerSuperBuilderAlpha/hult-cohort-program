import type { Page } from '@playwright/test';

/**
 * Wipe the emulator's Firestore documents and auth accounts.
 *
 * This is the fix for the WebChannel-collapse flake (TESTING.md §0). Every test signs up a
 * member, and `subscribeToMembers` watches the whole `members` collection — so the snapshot
 * fan-out grows with every account the run has ever created. Past ~45 members the emulator's
 * back channel gives up ("too many pending messagings … abort the channel"), and from then
 * on the SDK is dead while REST keeps answering, so sign-up hangs on "Working…" with no
 * error and a different pair of tests fails each run.
 *
 * `emulators:exec` already hands each *run* a fresh, empty database — that stops run-to-run
 * pollution but does nothing about accumulation *within* a run. Calling this before every
 * test keeps `members` at ~one doc, so the fan-out never approaches the collapse threshold.
 *
 * **Firestore documents only — deliberately NOT the auth accounts.** Deleting the auth user
 * mid-run once took the whole emulator down: a client whose listeners hadn't finished
 * tearing down from the just-ended test would suddenly have an invalid token, its reads
 * would fail rules evaluation ("No matching allow statements" — `request.auth` is null), and
 * the Firestore SDK would retry-storm the emulator on those denials until it fell over
 * (permission-denied → unavailable → ECONNREFUSED). Clearing a *document* out from under a
 * still-authenticated client is benign by comparison — a missing doc reads as empty, no
 * retry. Auth accounts accumulate harmlessly (unique emails, no snapshot fan-out), so the
 * collapse this guards against is a Firestore-collection problem, not an auth one.
 *
 * Only the emulator exposes this `/emulator/v1/...` endpoint; the full suite may never run
 * against anything else (playwright.config guards that), so hard-coding localhost is safe.
 */
const EMULATOR_PROJECT = 'demo-pulse';
// Port defaults to 8080, overridable so a run isolated onto a spare port (to dodge a second
// concurrent emulator) resets the right one.
const FS_PORT = process.env.FIRESTORE_EMULATOR_PORT ?? '8080';
const FIRESTORE_RESET = `http://127.0.0.1:${FS_PORT}/emulator/v1/projects/${EMULATOR_PROJECT}/databases/(default)/documents`;

export async function resetEmulator(): Promise<void> {
  const firestore = await fetch(FIRESTORE_RESET, { method: 'DELETE' });
  // Fail loudly. A reset that silently no-ops brings the flake straight back, and a suite
  // that can't reach the emulator is invalid, not merely red — say so instead of drifting.
  if (!firestore.ok) {
    throw new Error(
      `Emulator reset failed (firestore ${firestore.status}). ` +
        `Is the Firestore emulator up on 8080 for project ${EMULATOR_PROJECT}?`
    );
  }
}

/**
 * Unique per run, so a re-run never collides with a leftover account.
 *
 * `.test` is a reserved TLD that can never resolve — a belt-and-braces guarantee that
 * nothing here can email a real person if these ever ran against a real project.
 */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@emulator.test`;
}

export const PASSWORD = 'emulator-pw-123';

/**
 * Projects and tasks are cohort-wide and persist across tests — that's the product
 * working as designed, not a leak. So every fixture name has to be unique per test, or
 * the second run of a suite finds three projects called "Alpha" and the locators go
 * ambiguous.
 */
export function uniqueName(base: string): string {
  return `${base} ${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
}

/**
 * Sign up a fresh account through the real UI — no manual DB edits, which is B1's point.
 *
 * Waits for the signed-in **shell**, not for a sentence.
 *
 * This used to wait for the text "you're in", which the home rework deleted — and every
 * test in the full suite starts here, so the whole thing went red at once and stayed red
 * while the checklist still claimed e2e green. A copy edit must not be able to do that
 * again: the nav is structure, it's the thing that proves you're actually signed in, and
 * it only renders once AppShell has a user.
 */
export async function signUp(page: Page, name: string, email: string): Promise<void> {
  await page.goto('/signin');
  await page.getByRole('button', { name: /create an account/i }).click();
  await page.getByPlaceholder('Your name').fill(name);
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();

  // A brand-new account lands on /connect now — the consent gate (spec §5.2), which is
  // deliberately OUTSIDE AppShell and has no 'sign out'. Wait for auth to settle anywhere,
  // then head into the app. Going straight to /board leaves the account in the "connected
  // to nothing" state most tests want: a working manual board with sensing switched off.
  await page.waitForURL(/\/(connect|board|$)/, { timeout: 15_000 }).catch(() => {});
  await page.goto('/board');
  // 'sign out' exists only inside AppShell, which renders only with a user — and unlike
  // the nav links it's present at every width (the nav moves to a bottom bar under 480).
  await page.getByRole('button', { name: 'sign out' }).waitFor({ timeout: 15_000 });
}

/** Sign out through the real control, the way a person would. */
export async function signOut(page: Page): Promise<void> {
  await page.goto('/board');
  await page.getByRole('button', { name: 'sign out' }).click();
  await page.waitForURL(/\/signin/);
}

export async function createProject(page: Page, name: string): Promise<void> {
  await page.goto('/projects');
  await page.getByRole('button', { name: 'New project' }).click();
  await page.getByPlaceholder('pm-nikjain15').fill(name);
  await page.getByRole('button', { name: 'Create project' }).click();
  await page.getByRole('link', { name, exact: true }).waitFor();
}

export async function createTask(
  page: Page,
  title: string,
  opts: { assignee?: string; project?: string } = {}
): Promise<void> {
  await page.goto('/board');
  await page.getByRole('button', { name: '+ add' }).click();
  await page.getByPlaceholder('Finish Firestore rules').fill(title);
  if (opts.project) {
    await page.getByLabel('Project', { exact: true }).selectOption({ label: opts.project });
  }
  if (opts.assignee) {
    await page.getByLabel('Assignee', { exact: true }).selectOption({ label: opts.assignee });
  }
  await page.getByRole('button', { name: 'Create task' }).click();
  await page.getByRole('heading', { name: title, exact: true }).waitFor();
}
