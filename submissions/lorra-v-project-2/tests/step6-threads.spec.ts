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
      if (attempt === 3) {
        throw new Error(`Seed login failed after retries. Last URL: ${page.url()}`);
      }
      await page.waitForTimeout(1000 * attempt);
    }
  }
}

test.describe.configure({ mode: "serial", timeout: 90_000 });

test.describe("Phase A Step 6 — threads", () => {
  test("opens a thread from a channel message, replies, and lists it under Threads", async ({
    page,
  }) => {
    await loginWithSeed(page);

    await page.goto("/channels/general");
    await expect(page.getByTestId("channel-view")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("message-composer")).toBeVisible();

    const rootMarker = `step6-root-${Date.now()}`;
    await page.getByTestId("composer-input").fill(rootMarker);
    await page.getByTestId("composer-send").click();
    await expect(page.getByTestId("composer-send")).toBeEnabled({ timeout: 30_000 });
    await expect(page.getByTestId("message-list").getByText(rootMarker)).toBeVisible({
      timeout: 30_000,
    });

    const rootItem = page
      .getByTestId("message-item")
      .filter({ hasText: rootMarker })
      .first();
    await rootItem.getByTestId("message-reply-thread").click();

    await expect(page.getByTestId("thread-panel")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("thread-root")).toContainText(rootMarker);

    const replyMarker = `step6-reply-${Date.now()}`;
    await page.getByTestId("thread-reply-input").fill(replyMarker);
    await page.getByTestId("thread-reply-send").click();
    await expect(page.getByTestId("thread-panel").getByText(replyMarker)).toBeVisible({
      timeout: 30_000,
    });

    await page.getByTestId("thread-close").click();
    await expect(page.getByTestId("thread-panel")).toHaveCount(0);

    await page.goto("/threads");
    await expect(page.getByTestId("threads-page")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("threads-list").getByText(rootMarker)).toBeVisible({
      timeout: 20_000,
    });
  });
});
