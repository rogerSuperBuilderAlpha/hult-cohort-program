import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@conexus.local";
const SEED_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "ConexusSeed!2026";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByTestId("dev-email").fill(ADMIN_EMAIL);
  await page.getByTestId("dev-password").fill(SEED_PASSWORD);
  await page.getByTestId("dev-login-submit").click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 20_000,
  });
}

test.describe.configure({ mode: "serial", timeout: 120_000 });

test.describe("Phase A Step 10 — Home, Tasks, Files, search, presence", () => {
  test("home digest, tasks, and files pages render", async ({ page }) => {
    await login(page);
    await page.goto("/");
    await expect(page.getByTestId("home-digest")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("home-unread-channels")).toBeVisible();
    await expect(page.getByTestId("home-mentions")).toBeVisible();
    await expect(page.getByTestId("home-tickets")).toBeVisible();

    await page.getByTestId("nav-tasks").click();
    await page.waitForURL("**/tasks", { timeout: 30_000 });
    await expect(page.getByTestId("tasks-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("tasks-list")).toBeVisible();
    await expect(page.getByTestId("tasks-filter-status")).toBeVisible();

    await page.getByTestId("nav-files").click();
    await page.waitForURL("**/files", { timeout: 30_000 });
    await expect(page.getByTestId("files-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("files-list")).toBeVisible();
    await expect(page.getByTestId("files-filter-channel")).toBeVisible();
  });

  test("global search finds a channel message", async ({ page }) => {
    await login(page);
    await page.goto("/channels/general");
    await expect(page.getByTestId("channel-view")).toBeVisible({ timeout: 30_000 });

    const marker = `step10-search-${Date.now()}`;
    const input = page.getByTestId("composer-input");
    await input.click();
    await input.pressSequentially(marker, { delay: 8 });
    await page.getByTestId("composer-send").click();
    await expect(page.getByTestId("message-list").getByText(marker)).toBeVisible({
      timeout: 45_000,
    });

    await page.getByTestId("global-search-input").fill(marker);
    await page.getByTestId("global-search").evaluate((form: HTMLFormElement) => form.requestSubmit());
    await expect(page.getByTestId("search-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("search-results").getByTestId("search-hit")).toContainText(
      marker,
      { timeout: 20_000 },
    );
  });

  test("presence dot marks the signed-in user online", async ({ page }) => {
    await login(page);
    await page.goto("/");
    await expect(page.getByTestId("home-digest")).toBeVisible({ timeout: 30_000 });
    const selfDot = page.locator('[data-testid="presence-dot"][data-online="true"]').first();
    await expect(selfDot).toBeVisible({ timeout: 20_000 });
  });
});
