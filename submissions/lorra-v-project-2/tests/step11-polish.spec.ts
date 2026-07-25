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

test.describe.configure({ mode: "serial", timeout: 90_000 });

test.describe("Phase A Step 11 — polish", () => {
  test("empty states, toast region, and mobile search are present", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/messages");
    await expect(page.getByTestId("messages-page")).toBeVisible({ timeout: 30_000 });
    // Either a list or the empty state is fine; empty state uses shared component.
    const empty = page.getByTestId("messages-empty");
    const list = page.getByTestId("messages-list");
    await expect(empty.or(list)).toBeVisible();

    await page.goto("/threads");
    await expect(page.getByTestId("threads-page")).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByTestId("threads-empty").or(page.getByTestId("threads-list")),
    ).toBeVisible();

    await page.goto("/files");
    await expect(page.getByTestId("files-page")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("files-list")).toBeVisible();

    await expect(page.getByTestId("toast-region")).toBeAttached();
    await expect(page.getByTestId("global-search-input")).toBeVisible();
  });

  test("composer send failure surfaces an error toast", async ({ page }) => {
    await login(page);
    await page.goto("/channels/general");
    await expect(page.getByTestId("channel-view")).toBeVisible({ timeout: 30_000 });

    // Force a client-visible failure by intercepting the server action POST.
    await page.route("**/channels/general", async (route) => {
      if (route.request().method() === "POST") {
        await route.abort("failed");
        return;
      }
      await route.continue();
    });

    const input = page.getByTestId("composer-input");
    await input.click();
    await input.pressSequentially(`step11-toast-${Date.now()}`, { delay: 5 });
    await page.getByTestId("composer-send").click();

    await expect(page.getByTestId("toast").first()).toBeVisible({ timeout: 15_000 });
  });
});
