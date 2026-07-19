import { expect, test } from './fixtures';
import { createProject, createTask, signUp, uniqueEmail, uniqueName } from './helpers';

/**
 * The assignee chips and the mobile filter collapse — the two changes that touch B8's
 * graded surface, so they get their own spec rather than a hopeful edit.
 *
 * The contract being protected:
 * - `select[data-filter="assignee"]` still exists and still filters by member label
 *   (crud.spec drives it for B7; here it's the "someone else…" control).
 * - Chips are sugar over the SAME url param — `?assignee=<uid>` / `?assignee=none` —
 *   so a filtered board stays a link you can send.
 * - 'unclaimed' filters WORK, not people: it shows tasks with no assignee, and there is
 *   no value anywhere that lists who's behind.
 * - Under 480 the controls collapse behind a "filters" toggle whose label counts active
 *   filters — a narrowed board must never look like an empty one.
 */

test.describe.configure({ timeout: 90_000 });

test('chips filter mine / unclaimed / everyone, and write the URL', async ({ page }) => {
  const me = 'Chip Probe';
  await signUp(page, me, uniqueEmail('chips'));

  const project = uniqueName('Chips');
  await createProject(page, project);

  const mine = uniqueName('Mine to do');
  const unclaimed = uniqueName('Nobody claimed this');
  await createTask(page, mine, { project }); // assignee defaults to the creator
  await createTask(page, unclaimed, { project, assignee: 'Nobody yet' });

  // Scope to this test's project — the emulator dataset is shared and persistent.
  await page.locator('select[data-filter="project"]').selectOption({ label: project });

  // unclaimed → only the unassigned card, and the URL says so.
  await page.getByRole('button', { name: 'unclaimed' }).click();
  await expect(page).toHaveURL(/assignee=none/);
  await expect(page.getByRole('heading', { name: unclaimed, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: mine, exact: true })).toBeHidden();

  // me → only my card.
  await page.getByRole('button', { name: 'me', exact: true }).click();
  await expect(page).toHaveURL(/assignee=/);
  await expect(page.getByRole('heading', { name: mine, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: unclaimed, exact: true })).toBeHidden();

  // everyone → both, and the default drops out of the URL entirely.
  await page.getByRole('button', { name: 'everyone' }).click();
  await expect(page).not.toHaveURL(/assignee=/);
  await expect(page.getByRole('heading', { name: mine, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: unclaimed, exact: true })).toBeVisible();

  // "someone else…" is the graded select, alive and selecting by label.
  await page.locator('select[data-filter="assignee"]').selectOption({ label: me });
  await expect(page.getByRole('heading', { name: mine, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: unclaimed, exact: true })).toBeHidden();
});

test('under 480 the filters collapse behind an honest counter; + add stays', async ({ page }) => {
  await signUp(page, 'Fold Probe', uniqueEmail('fold'));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/board');

  // Collapsed by default: the board leads, the selects wait.
  const toggle = page.getByRole('button', { name: /^filters/ });
  await expect(toggle).toBeVisible();
  await expect(page.getByRole('button', { name: '+ add' })).toBeVisible();
  await expect(page.locator('select[data-filter="assignee"]')).toBeHidden();

  // Open → the real controls, chips included.
  await toggle.click();
  await expect(page.locator('select[data-filter="assignee"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'unclaimed' })).toBeVisible();

  // Narrow something, fold it away — the label must confess the active filter.
  await page.locator('select[data-filter="status"]').selectOption('todo');
  await toggle.click();
  await expect(page.locator('select[data-filter="assignee"]')).toBeHidden();
  await expect(page.getByRole('button', { name: 'filters · 1', exact: false })).toBeVisible();
});
