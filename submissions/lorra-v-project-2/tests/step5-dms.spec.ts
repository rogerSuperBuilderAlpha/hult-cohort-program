import { expect, test, type Page } from "@playwright/test";

const SEED_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@conexus.local";
const SEED_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "ConexusSeed!2026";
const PEER_EMAIL = "asha@conexus.local";

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
      if (attempt === 3) {
        throw new Error(`Seed login failed after retries. Last URL: ${page.url()}`);
      }
      await page.waitForTimeout(1000 * attempt);
    }
  }
}

test.describe.configure({ mode: "serial", timeout: 60_000 });

test.describe("Phase A Step 5 — DMs", () => {
  test("starts a 1:1 DM, sends a message, and lists it in the sidebar", async ({
    page,
  }) => {
    await loginWithSeed(page);

    await page.getByTestId("start-dm-open").first().click();
    await expect(page.getByTestId("start-dm-modal")).toBeVisible();
    await page.getByTestId(`start-dm-person-${PEER_EMAIL}`).check();
    await page.getByTestId("start-dm-submit").click();

    await expect(page).toHaveURL(/\/messages\/[0-9a-f-]{36}/, { timeout: 20_000 });
    await expect(page.getByTestId("dm-view")).toBeVisible();
    await expect(page.getByTestId("dm-title")).toContainText("Asha");
    await expect(page.getByTestId("message-composer")).toBeVisible();

    const marker = `step5-dm-${Date.now()}`;
    await page.getByTestId("composer-input").fill(marker);
    await page.getByTestId("composer-send").click();
    await expect(page.getByTestId("message-list").getByText(marker)).toBeVisible({
      timeout: 20_000,
    });

    await page.goto("/messages");
    await expect(page.getByTestId("messages-page")).toBeVisible();
    await expect(page.getByTestId("messages-list")).toBeVisible();
    await expect(page.getByTestId("messages-list").getByText("Asha")).toBeVisible();
  });
});
