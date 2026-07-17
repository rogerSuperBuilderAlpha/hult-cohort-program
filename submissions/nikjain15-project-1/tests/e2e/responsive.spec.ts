import { expect, test, type Page } from '@playwright/test';
import { createProject, createTask, signUp, uniqueEmail, uniqueName } from './helpers';

/**
 * Wait for the shell to be painted, and nothing more.
 *
 * NOT `networkidle` — that never fires in this app, and it took six 30-second timeouts to
 * see why. Firestore's `onSnapshot` holds a streaming channel open for the life of the
 * page: that's the product working (the whole app is realtime listeners), so "the network
 * went quiet" is a state that by design never arrives. Any test waiting for it is waiting
 * for the realtime feature to break.
 */
async function settle(page: Page): Promise<void> {
  await page.getByRole('banner').waitFor({ timeout: 15_000 });
}

/**
 * Spec §4's responsive table, asserted.
 *
 * **Computed styles, not screenshots.** A screenshot diff tells you something moved; it
 * doesn't tell you the board stopped being a carousel, and it fails on a font hint that
 * nobody cares about. Every assertion here is a claim from the spec's table, checked
 * against what the browser actually computed.
 *
 * Breakpoints are named for what breaks, not for devices — a 900px desktop window gets
 * the tablet layout, and that's correct.
 */

const WIDTHS = [320, 375, 480, 768, 1024, 1440] as const;

/**
 * Every test signs up, and sign-up is the slow part: the emulator's dataset is cohort-wide
 * and grows across runs, so the listeners have more to deliver each time. The default 30s
 * is enough on an empty database and not enough on a real one — and a suite that fails on
 * its own fixtures teaches you nothing about the layout it was meant to test.
 */
test.describe.configure({ timeout: 90_000 });

/** The board's own breakpoint: below this it's a carousel, at it and above it's a grid. */
const GRID_AT = 768;

/** Below this the nav moves to the bottom bar so the targets stay reachable one-handed. */
const BOTTOM_NAV_BELOW = 480;

test.describe('responsive — spec §4', () => {
  /**
   * Layout tests need a signed-in shell and nothing else — the board's columns render at
   * every width whether or not they hold cards, and the assertions here are about the
   * container, never its contents. An earlier version seeded a project and a task in
   * beforeAll; nothing asserted on them, and the hook timed out building fixtures no test
   * read.
   *
   * Auth state lives in IndexedDB (Firebase's own persistence), which storageState
   * doesn't carry, so each context genuinely has to sign up. That's the cost of the suite.
   */
  test.beforeEach(async ({ page }) => {
    await signUp(page, 'Small Screen', uniqueEmail('resp'));
  });

  for (const width of WIDTHS) {
    test(`${width}px — no horizontal body scroll anywhere`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });

      // A page that scrolls sideways is the single most obvious "this wasn't tested on a
      // phone" tell, and it's the one thing every route must never do.
      for (const path of ['/', '/board', '/projects', '/recipes', '/settings']) {
        await page.goto(path);
        await settle(page);
        const overflows = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth
        );
        expect(overflows, `${path} scrolls horizontally`).toBe(false);
      }
    });
  }

  /**
   * The board is the hard case, and this is the assertion that matters most in the file.
   *
   * Stacking the columns destroys the only thing a kanban is for: seeing flow across
   * states. Under 768 it must stay a horizontally scroll-snapped carousel.
   */
  for (const width of WIDTHS.filter((w) => w < GRID_AT)) {
    test(`${width}px — board is a scroll-snapped carousel, NOT stacked`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/board');

      const board = page.getByTestId('board');
      await board.waitFor();

      const style = await board.evaluate((el) => {
        const s = getComputedStyle(el);
        return { display: s.display, overflowX: s.overflowX, snapType: s.scrollSnapType };
      });

      expect(style.display).toBe('flex');
      expect(style.overflowX).toBe('auto');
      expect(style.snapType).toContain('x');

      // The peek: the columns must be wider than the viewport can hold, or there's
      // nothing to scroll and the next column isn't visibly there.
      const scrolls = await board.evaluate((el) => el.scrollWidth > el.clientWidth);
      expect(scrolls, 'columns fit — there is no peek').toBe(true);

      // Stacked would mean every column starts at the same x. A carousel means they don't.
      const xs = await page
        .locator('[data-column]')
        .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().x)));
      expect(new Set(xs).size, 'columns share an x — the board stacked').toBe(xs.length);
    });
  }

  for (const width of WIDTHS.filter((w) => w >= GRID_AT)) {
    test(`${width}px — board is a 3-column grid`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/board');

      const board = page.getByTestId('board');
      await board.waitFor();

      const style = await board.evaluate((el) => {
        const s = getComputedStyle(el);
        return { display: s.display, columns: s.gridTemplateColumns.split(' ').length };
      });

      expect(style.display).toBe('grid');
      expect(style.columns).toBe(3);

      // All three columns on one row: same y, three distinct x's.
      const boxes = await page
        .locator('[data-column]')
        .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: Math.round(r.x), y: Math.round(r.y) })));
      expect(new Set(boxes.map((b) => b.y)).size, 'columns wrapped to a second row').toBe(1);
      expect(new Set(boxes.map((b) => b.x)).size).toBe(3);
    });
  }

  /**
   * Bottom nav under 480, top nav at 480+. The spec's rule is about reach, not fashion:
   * a top nav on a 375px phone is a stretch for a thumb.
   */
  for (const width of WIDTHS) {
    test(`${width}px — nav is ${width < BOTTOM_NAV_BELOW ? 'bottom' : 'top'}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/board');

      const bottomNav = page.locator('nav.fixed');
      const expectBottom = width < BOTTOM_NAV_BELOW;

      await expect(bottomNav).toBeVisible({ visible: expectBottom });

      if (expectBottom) {
        // Every bottom-nav target must clear the 44px floor, or the nav is decorative.
        const heights = await bottomNav
          .locator('a')
          .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
        for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
      }
    });
  }

  /**
   * The feed is the opposite problem to the board: narratives are prose, and past ~68ch
   * they get harder to read. Extra width becomes margin, never a second column.
   */
  test('1440px — feed is capped at 68ch and centred, never a second column', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await settle(page);

    const feed = page.locator('.max-w-\\[68ch\\]').first();
    await feed.waitFor({ timeout: 15_000 });

    const { width, viewport } = await feed.evaluate((el) => ({
      width: el.getBoundingClientRect().width,
      viewport: window.innerWidth,
    }));

    // The cap is the point: at 1440 the feed must be much narrower than the window.
    expect(width).toBeLessThan(viewport * 0.75);
    // 68ch at this font lands around 600px. A generous band — the assertion is "capped
    // and readable", not a pixel that a font update would break.
    expect(width).toBeGreaterThan(380);
    expect(width).toBeLessThan(800);
  });

  /**
   * Landscape phone: a sticky header eats the screen the board needs, so it releases
   * under max-height:500px. Named for what breaks, not for a device.
   */
  // getByRole('banner'), not locator('header') — every board column has its own <header>,
  // so the bare tag selector is ambiguous and fails on strict mode rather than on truth.
  test('landscape phone — the sticky header releases under 500px tall', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/board');

    await expect(page.getByRole('banner')).toHaveCSS('position', 'static');
  });

  test('portrait — the header is sticky', async ({ page }) => {
    // Narrow AND tall: the case the old max-width query got backwards.
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/board');

    await expect(page.getByRole('banner')).toHaveCSS('position', 'sticky');
  });

  /**
   * 200% zoom must reflow, not scroll sideways. Emulated the honest way — halving the
   * viewport at a doubled DPR is what a zoomed browser actually reports to CSS.
   */
  test('200% zoom reflows without horizontal scroll', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 640, height: 400 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await signUp(page, 'Zoom Probe', uniqueEmail('zoom'));

    for (const path of ['/', '/board', '/recipes']) {
      await page.goto(path);
      await settle(page);
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );
      expect(overflows, `${path} scrolls horizontally at 200%`).toBe(false);
    }

    await context.close();
  });

  /**
   * Drag is pointer:fine only, so on a touch device the status control IS the workflow.
   * B6 is graded and drag alone fails it on a phone.
   */
  test('touch — every card has a ≥44px status control', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await signUp(page, 'Touch Probe', uniqueEmail('touch'));

    const project = uniqueName('Touch');
    await createProject(page, project);
    const title = uniqueName('Touch card');
    await createTask(page, title, { project });

    await page.goto('/board');
    const control = page.locator('[data-column] select').first();
    await control.waitFor();

    const height = await control.evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(44);

    await context.close();
  });

  /**
   * prefers-reduced-motion is honoured. Someone who asked the OS to stop animating things
   * meant it — a feed that fades rows in anyway is ignoring an accessibility setting.
   */
  test('prefers-reduced-motion is honoured', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto('/');
    await settle(page);

    const animated = await page.evaluate(() =>
      Array.from(document.querySelectorAll('main *')).filter((el) => {
        const s = getComputedStyle(el);
        const dur = parseFloat(s.animationDuration) + parseFloat(s.transitionDuration);
        return dur > 0.1;
      }).length
    );

    expect(animated, 'things still animate under prefers-reduced-motion').toBe(0);
  });
});
