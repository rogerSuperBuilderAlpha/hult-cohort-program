import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@conexus.local";
const PEER_EMAIL = "asha@conexus.local";
const SEED_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "ConexusSeed!2026";

async function login(page: Page, email: string) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    await page.goto("/login");
    await expect(page.getByTestId("dev-login-submit")).toBeVisible();
    await page.getByTestId("dev-email").fill(email);
    await page.getByTestId("dev-password").fill(SEED_PASSWORD);
    await page.getByTestId("dev-login-submit").click();
    try {
      await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
        timeout: 20_000,
      });
      return;
    } catch {
      if (attempt === 3) throw new Error(`Login failed for ${email}`);
      await page.waitForTimeout(1000 * attempt);
    }
  }
}

async function signOut(page: Page) {
  await page.getByTestId("sign-out").click();
  await page.waitForURL(/\/login/, { timeout: 20_000 });
}

test.describe.configure({ mode: "serial", timeout: 120_000 });

test.describe("Phase A Step 7 — notifications", () => {
  test("DM creates a feed item; recipient sees badge and can mark all read", async ({
    page,
  }) => {
    const marker = `step7-dm-${Date.now()}`;

    await login(page, ADMIN_EMAIL);
    await expect(page.getByTestId("notification-bell")).toBeVisible();
    await expect(page.getByTestId("channel-link-general")).toBeVisible();

    // Ensure a DM with Asha exists and send a message
    await page.getByTestId("start-dm-open").first().click();
    await expect(page.getByTestId("start-dm-modal")).toBeVisible();
    await page.getByTestId(`start-dm-person-${PEER_EMAIL}`).check();
    await page.getByTestId("start-dm-submit").click();
    await expect(page).toHaveURL(/\/messages\/[0-9a-f-]{36}/, { timeout: 20_000 });
    await expect(page.getByTestId("dm-view")).toBeVisible();

    await expect(page.getByTestId("message-composer")).toBeVisible();
    const input = page.getByTestId("composer-input");
    await input.click();
    await input.fill("");
    await input.pressSequentially(marker, { delay: 15 });
    await expect(input).toHaveValue(marker);
    await page.getByTestId("composer-send").click();
    await expect(page.getByTestId("message-list").getByText(marker)).toBeVisible({
      timeout: 45_000,
    });

    await signOut(page);
    await login(page, PEER_EMAIL);

    await expect(page.getByTestId("notification-bell")).toBeVisible();
    await expect(page.getByTestId("notification-badge")).toBeVisible({
      timeout: 20_000,
    });

    await page.getByTestId("notification-bell").click();
    await expect(page.getByTestId("notification-panel")).toBeVisible();
    await expect(page.getByTestId("notification-panel")).toContainText(
      "sent a direct message",
    );

    await page.getByTestId("notification-mark-all").click();
    await expect(page.getByTestId("notification-badge")).toHaveCount(0, {
      timeout: 15_000,
    });
  });

  test("channel notify level control is available", async ({ page }) => {
    await login(page, ADMIN_EMAIL);
    await page.goto("/channels/general");
    await expect(page.getByTestId("channel-view")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("channel-notify-level")).toBeVisible();
    await page.getByTestId("channel-notify-level").selectOption("mentions");
    await expect(page.getByTestId("channel-notify-level")).toHaveValue("mentions");
  });
});
