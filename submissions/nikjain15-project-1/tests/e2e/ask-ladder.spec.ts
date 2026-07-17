import { expect, test } from '@playwright/test';
import { createProject, signUp, uniqueEmail, uniqueName } from './helpers';

/**
 * The standing ask — DESIGN-SPEC §6, rung 3: "Nobody's on this".
 *
 * The bug: that rung needs `assigneeUid === null`, and nothing could produce it. The task
 * modal listed members only and defaulted to you; sensed cards assign to the actor. Rungs
 * 1-2 need Broker (week 3), so rung 3 was the ONLY social ask reachable in week 1 — and it
 * was dead code. Home could only ever hand you your own to-do list, which is the opposite
 * of the standard this is judged by.
 *
 * SCOPE, deliberately. This asserts the integration that was broken: the modal can leave
 * work unassigned, and Home then asks the cohort. It does NOT assert the ladder's
 * precedence, because that isn't soundly testable here — the ask is cohort-wide by design
 * and picks the oldest unclaimed task in the whole database, so any leftover from any
 * earlier run decides the outcome, not this test's fixtures. Unique names don't help when
 * the thing under test is global. Precedence is a pure function and is unit-tested
 * exhaustively in tests/unit/sense.test.ts — that's the right place for it.
 */

test.describe.configure({ timeout: 90_000 });

test('work can be left unassigned, and Home then asks the cohort to pick it up', async ({ page }) => {
  await signUp(page, 'Ladder Probe', uniqueEmail('ladder'));

  const project = uniqueName('Ladder');
  await createProject(page, project);

  await page.goto('/board');
  await page.getByRole('button', { name: '+ add' }).click();

  // The option whose absence killed the rung.
  const assignee = page.getByLabel('Assignee', { exact: true });
  await expect(assignee.getByRole('option', { name: 'Nobody yet' })).toBeAttached();
  // The safe default survives: you, not nobody.
  await expect(assignee).toHaveValue(/.+/);

  const unclaimed = uniqueName('Pick this up');
  await page.getByPlaceholder('Finish Firestore rules').fill(unclaimed);
  await page.getByLabel('Project', { exact: true }).selectOption({ label: project });
  await assignee.selectOption({ label: 'Nobody yet' });
  await page.getByRole('button', { name: 'Create task' }).click();
  await page.getByRole('heading', { name: unclaimed, exact: true }).waitFor();

  // The card carries no assignee — the state the ladder filters on.
  const card = page.getByRole('button', { name: unclaimed });
  await expect(card).toBeVisible();

  // Home makes the social ask. Which unclaimed task it names is the cohort's business,
  // not this test's — the rung firing at all is what was impossible before.
  await page.goto('/');
  await expect(page.getByText('Nobody’s on this')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('link', { name: /pick it up/i })).toHaveAttribute(
    'href',
    /status=todo/
  );
});
