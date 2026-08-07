import { expect, test, type Page } from "@playwright/test";

const SEED_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@conexus.local";
const SEED_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "ConexusSeed!2026";

async function loginWithSeed(page: Page) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto("/login");
    await expect(page.getByTestId("dev-login-submit")).toBeVisible();
    await page.getByTestId("dev-email").fill(SEED_EMAIL);
    await page.getByTestId("dev-password").fill(SEED_PASSWORD);
    await page.getByTestId("dev-login-submit").click();

    try {
      await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
        timeout: 20_000,
      });
      return;
    } catch {
      const err = page.url();
      if (attempt === 3) {
        throw new Error(`Seed login failed after retries. Last URL: ${err}`);
      }
      await page.waitForTimeout(1000 * attempt);
    }
  }
}

test.describe.configure({ mode: "serial", timeout: 60_000 });

test.describe("Phase A Step 4 — channel messaging", () => {
  test("opens #general, sends a message, and can open create-channel modal", async ({
    page,
  }) => {
    await loginWithSeed(page);

    await page.getByTestId("channel-link-general").click();
    await expect(page).toHaveURL(/\/channels\/general/);
    await expect(page.getByTestId("channel-view")).toBeVisible();
    await expect(page.getByTestId("channel-title")).toHaveText("#general");
    await expect(page.getByTestId("message-list")).toBeVisible();
    await expect(page.getByTestId("message-composer")).toBeVisible();

    const marker = `step4-smoke-${Date.now()}`;
    await page.getByTestId("composer-input").fill(marker);
    await page.getByTestId("composer-send").click();
    await expect(page.getByTestId("message-list").getByText(marker)).toBeVisible({
      timeout: 20_000,
    });

    await page.getByTestId("create-channel-open").click();
    await expect(page.getByTestId("create-channel-modal")).toBeVisible();
    await expect(page.getByTestId("create-channel-name")).toBeVisible();
  });
});
