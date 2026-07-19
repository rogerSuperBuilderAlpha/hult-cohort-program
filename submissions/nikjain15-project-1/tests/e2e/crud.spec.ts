import { expect, test } from './fixtures';
import { createProject, createTask, signOut, signUp, uniqueEmail, uniqueName } from './helpers';

/**
 * B1–B10, driven the way a peer reviewer would.
 *
 * Runs against the EMULATOR, not production: these tests create members, projects and
 * tasks, and that data must never land in the collection reviewers read. Test fixtures
 * are not product seed data, and fake cohort activity would make the submission's central
 * honesty claim false.
 *
 *   npm run emulator                       # terminal 1
 *   npm run dev:emulator                   # terminal 2
 *   npm run test:e2e                       # terminal 3
 *
 * Fixture names are unique per test because projects and tasks are cohort-wide and
 * persist — that's the product working, so the tests accommodate it rather than
 * pretending each one starts on an empty database.
 */

test.describe('B1 · B3 — multi-user auth, open registration', () => {
  /**
   * These used to assert the text "you're in", which the home rework deleted — so they
   * failed on a sentence rather than on anything true about auth, and took the rest of
   * the suite's confidence down with them.
   *
   * What B1 actually claims is that a stranger can register with no allowlist and no
   * manual DB edits. The proof of that isn't a greeting: it's that a brand-new account
   * ends up signed in AND its member doc reaches the cohort feed under its own name.
   * That's structure, and a copy edit can't quietly invalidate it.
   */
  test('signs up two fresh accounts with no allowlist and no manual DB edits', async ({ browser }) => {
    for (const base of ['Ada', 'Grace']) {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Unique: the feed is cohort-wide and persists, so a fixed name matches every
      // previous run's row too and the locator goes ambiguous.
      const name = uniqueName(base);
      await signUp(page, name, uniqueEmail(base.toLowerCase()));

      await expect(page.getByRole('button', { name: 'sign out' })).toBeVisible();
      // The member_joined row is on Home, not the board — sign-up now lands on the consent
      // gate and the helper moves on to /board, so come to Home to read the feed.
      await page.goto('/');
      await expect(page.getByText(`${name} joined the cohort`)).toBeVisible({ timeout: 15_000 });

      await context.close();
    }
  });

  test('signs back in with email and password', async ({ page }) => {
    const email = uniqueEmail('returning');
    await signUp(page, 'Returning Member', email);
    await signOut(page);

    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('Password').fill('emulator-pw-123');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Back inside the shell, and off the sign-in page — the two things "signed in" means.
    await expect(page.getByRole('button', { name: 'sign out' })).toBeVisible({ timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/signin/);
  });

  test('says what to do when the email is already registered', async ({ page }) => {
    const email = uniqueEmail('dupe');
    await signUp(page, 'First Claim', email);
    await signOut(page);

    await page.getByRole('button', { name: /create an account/i }).click();
    await page.getByPlaceholder('Your name').fill('Second Claim');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('Password').fill('emulator-pw-123');
    await page.getByRole('button', { name: 'Create account' }).click();

    // Scoped to the form: Next renders its own always-present empty
    // role="alert" route announcer, so a bare getByRole('alert') is ambiguous.
    const error = page.locator('form [role="alert"]');
    // Plain language that says what to do next — never a raw Firebase code.
    await expect(error).toContainText(/sign in instead/i);
    await expect(error).not.toContainText('auth/');
  });
});

test.describe('B4 — projects: create, edit, archive', () => {
  test('creates, edits, archives and restores a project', async ({ page }) => {
    await signUp(page, 'Project Owner', uniqueEmail('proj'));

    const name = uniqueName('Alpha');
    const renamed = `${name} renamed`;
    await createProject(page, name);

    const row = page.locator('li', { hasText: name });
    await row.getByRole('button', { name: 'edit' }).click();
    await page.getByPlaceholder('pm-nikjain15').fill(renamed);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('link', { name: renamed, exact: true })).toBeVisible();

    await page.locator('li', { hasText: renamed }).getByRole('button', { name: 'archive' }).click();
    await expect(page.getByRole('link', { name: renamed, exact: true })).toBeHidden();

    // Archived is hidden, not gone — nothing in Project 1 hard-deletes a project.
    await page.getByRole('button', { name: 'show archived' }).click();
    await expect(page.getByRole('link', { name: renamed, exact: true })).toBeVisible();
    await page.locator('li', { hasText: renamed }).getByRole('button', { name: 'restore' }).click();
    await page.getByRole('button', { name: 'show active' }).click();
    await expect(page.getByRole('link', { name: renamed, exact: true })).toBeVisible();
  });
});

test.describe('B5 · B6 — tasks and the status workflow', () => {
  test('creates a task with every field and moves it through all three states', async ({ page }) => {
    await signUp(page, 'Task Author', uniqueEmail('task'));
    const project = uniqueName('Beta');
    await createProject(page, project);

    const title = uniqueName('Fix OAuth redirect');
    await page.goto('/board');
    await page.getByRole('button', { name: '+ add' }).click();
    await page.getByPlaceholder('Finish Firestore rules').fill(title);
    await page.getByPlaceholder('optional').fill('Popup closes before the credential resolves.');
    await page.getByLabel('Project', { exact: true }).selectOption({ label: project });
    await page.getByLabel('Due', { exact: true }).fill('2026-07-10');
    await page.getByRole('button', { name: 'Create task' }).click();

    const card = page.locator('article', { hasText: title });
    await expect(card).toBeVisible();
    // A manual card must never claim a receipt it didn't earn.
    await expect(card).toContainText('you · by hand');

    await page.locator('select[data-filter="project"]').selectOption({ label: project });
    await expect(page.locator('[data-column="todo"] h2')).toContainText('to do · 1');

    await card.getByRole('combobox').selectOption('in_progress');
    await expect(page.locator('[data-column="in_progress"] h2')).toContainText('in progress · 1');

    await page.locator('article', { hasText: title }).getByRole('combobox').selectOption('done');
    await expect(page.locator('[data-column="done"] h2')).toContainText('done · 1');
  });

  test('a due date is red only while it is overdue', async ({ page }) => {
    await signUp(page, 'Due Watcher', uniqueEmail('due'));
    const project = uniqueName('Gamma');
    await createProject(page, project);

    const overdue = uniqueName('Overdue thing');
    const upcoming = uniqueName('Upcoming thing');

    for (const [title, date] of [
      [overdue, '2020-01-01'],
      [upcoming, '2099-01-01'],
    ]) {
      await page.goto('/board');
      await page.getByRole('button', { name: '+ add' }).click();
      await page.getByPlaceholder('Finish Firestore rules').fill(title);
      await page.getByLabel('Project', { exact: true }).selectOption({ label: project });
      await page.getByLabel('Due', { exact: true }).fill(date);
      await page.getByRole('button', { name: 'Create task' }).click();
      // Wait for the card before the next iteration's reload. Clicking "Create task" only
      // dispatches the click — `save()` awaits the Firestore write, then closes the modal —
      // so the very next `page.goto('/board')` could abort that in-flight write and the
      // first task would silently never persist. Under full-suite load that lost the
      // overdue card outright. Waiting for the heading is the same barrier createTask() uses.
      await page.getByRole('heading', { name: title, exact: true }).waitFor();
    }

    // Compare the two computed colours rather than pinning a literal: Tailwind 4 emits
    // lab()/oklch(), so a hard-coded rgb() would be testing the CSS engine's serialisation
    // rather than the product's promise. The promise is: red means debt, and nothing else.
    const colourOf = (title: string, day: string) =>
      page
        .locator('article', { hasText: title })
        .getByText(day)
        .evaluate((el) => getComputedStyle(el).color);

    const overdueColour = await colourOf(overdue, 'Jan 1');
    const upcomingColour = await colourOf(upcoming, 'Jan 1');
    expect(overdueColour).not.toBe(upcomingColour);

    // Done is not debt — finishing something late must not keep shouting at you.
    await page.locator('article', { hasText: overdue }).getByRole('combobox').selectOption('done');
    await expect
      .poll(() => colourOf(overdue, 'Jan 1'))
      .toBe(upcomingColour);
  });
});

test.describe('B7 · B9 · C4 — assignment and realtime across two accounts', () => {
  test('assigns to another member, and the board moves in their browser without a reload', async ({
    browser,
  }) => {
    // Two independent contexts = two real sessions. One browser with two tabs shares
    // auth storage and would silently test one account twice.
    const alice = await browser.newContext();
    const bob = await browser.newContext();
    const alicePage = await alice.newPage();
    const bobPage = await bob.newPage();

    const bobName = uniqueName('Bob');
    await signUp(bobPage, bobName, uniqueEmail('bob'));
    await signUp(alicePage, uniqueName('Alice'), uniqueEmail('alice'));

    const project = uniqueName('Shared work');
    await createProject(alicePage, project);

    // Bob watches his board, filtered to this project, while Alice assigns him something.
    // No reload after this line.
    await bobPage.goto('/board');
    await bobPage.locator('select[data-filter="project"]').selectOption({ label: project });
    await expect(bobPage.locator('[data-column="todo"] h2')).toContainText('to do · 0');

    const title = uniqueName('Wire up the sensor');
    await createTask(alicePage, title, { assignee: bobName, project });

    // Arrives over onSnapshot. "Realtime or it didn't happen."
    await expect(bobPage.locator('article', { hasText: title })).toBeVisible({ timeout: 15_000 });
    await expect(bobPage.locator('[data-column="todo"] h2')).toContainText('to do · 1');

    // B7: the assignee genuinely sees it as theirs.
    await bobPage.locator('select[data-filter="assignee"]').selectOption({ label: bobName });
    await expect(bobPage.locator('article', { hasText: title })).toBeVisible();

    // And a status change Bob makes shows up for Alice, also without a reload.
    await alicePage.goto('/board');
    await alicePage.locator('select[data-filter="project"]').selectOption({ label: project });
    await expect(alicePage.locator('article', { hasText: title })).toBeVisible();
    await bobPage.locator('article', { hasText: title }).getByRole('combobox').selectOption('done');
    await expect(alicePage.locator('[data-column="done"] h2')).toContainText('done · 1', {
      timeout: 15_000,
    });

    await alice.close();
    await bob.close();
  });
});

test.describe('B8 — filters', () => {
  test('filters by status and reflects it in the URL', async ({ page }) => {
    await signUp(page, 'Filter User', uniqueEmail('filter'));
    const project = uniqueName('Delta');
    await createProject(page, project);

    const stays = uniqueName('Stays in todo');
    const goes = uniqueName('Goes to done');
    await createTask(page, stays, { project });
    await createTask(page, goes, { project });

    await page.locator('select[data-filter="project"]').selectOption({ label: project });
    await page.locator('article', { hasText: goes }).getByRole('combobox').selectOption('done');

    await page.locator('select[data-filter="status"]').selectOption('todo');
    // A filtered board is a link you can send.
    await expect(page).toHaveURL(/status=todo/);
    await expect(page.locator('article', { hasText: stays })).toBeVisible();
    await expect(page.locator('article', { hasText: goes })).toBeHidden();

    // The default drops out of the URL rather than sitting there as noise.
    await page.locator('select[data-filter="status"]').selectOption('all');
    await expect(page).not.toHaveURL(/status=/);
  });

  test('filters by project, combinable with status', async ({ page }) => {
    await signUp(page, 'Combo User', uniqueEmail('combo'));
    const epsilon = uniqueName('Epsilon');
    const zeta = uniqueName('Zeta');
    await createProject(page, epsilon);
    await createProject(page, zeta);

    const inEpsilon = uniqueName('In epsilon');
    const inZeta = uniqueName('In zeta');
    await createTask(page, inEpsilon, { project: epsilon });
    await createTask(page, inZeta, { project: zeta });

    await page.locator('select[data-filter="project"]').selectOption({ label: epsilon });
    await expect(page).toHaveURL(/project=/);
    await expect(page.locator('article', { hasText: inEpsilon })).toBeVisible();
    await expect(page.locator('article', { hasText: inZeta })).toBeHidden();

    // Combined with status, each filter narrows the last.
    await page.locator('select[data-filter="status"]').selectOption('done');
    await expect(page.locator('article', { hasText: inEpsilon })).toBeHidden();
  });
});

test.describe('B10 — responsive', () => {
  // Assert the computed style, not a screenshot: the board switching from carousel to
  // grid at 768 is a behavioural promise, and a screenshot can't tell you it broke.
  for (const width of [320, 375, 480, 768, 1024, 1440]) {
    test(`no horizontal body scroll at ${width}px`, async ({ page }) => {
      await signUp(page, 'Small Screen', uniqueEmail('resp'));
      const project = uniqueName('Responsive');
      await createProject(page, project);
      await createTask(page, uniqueName('A task with a reasonably long title to push the layout'), {
        project,
      });

      await page.setViewportSize({ width, height: 800 });
      await page.goto('/board');
      await page.locator('[data-testid="board"]').waitFor();

      const overflows = await page.evaluate(
        () => document.body.scrollWidth > document.body.clientWidth
      );
      expect(overflows).toBe(false);
    });
  }

  test('the board is a carousel below 768 and a grid at 768', async ({ page }) => {
    await signUp(page, 'Board Shape', uniqueEmail('shape'));
    const project = uniqueName('Shape');
    await createProject(page, project);
    await createTask(page, uniqueName('Shape task'), { project });

    const board = page.locator('[data-testid="board"]');

    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/board');
    await board.waitFor();
    // It must NOT stack: stacking destroys the only thing a kanban is for.
    await expect(board).toHaveCSS('display', 'flex');
    await expect(board).toHaveCSS('overflow-x', 'auto');

    await page.setViewportSize({ width: 768, height: 800 });
    await expect(board).toHaveCSS('display', 'grid');
  });
});
