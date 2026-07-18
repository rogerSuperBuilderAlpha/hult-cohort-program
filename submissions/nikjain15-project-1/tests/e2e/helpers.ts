import type { Page } from '@playwright/test';

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
