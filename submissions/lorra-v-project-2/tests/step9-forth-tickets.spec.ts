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

test.describe("Phase A Step 9 — Forth tickets from messages", () => {
  test("creates a Forth ticket card as a thread reply", async ({ page }) => {
    await login(page);
    await page.goto("/channels/general");
    await expect(page.getByTestId("channel-view")).toBeVisible({ timeout: 30_000 });

    const rootMarker = `step9-root-${Date.now()}`;
    const input = page.getByTestId("composer-input");
    await input.click();
    await input.pressSequentially(rootMarker, { delay: 10 });
    await page.getByTestId("composer-send").click();
    await expect(page.getByTestId("message-list").getByText(rootMarker)).toBeVisible({
      timeout: 45_000,
    });

    const rootItem = page
      .getByTestId("message-item")
      .filter({ hasText: rootMarker })
      .first();
    await rootItem.getByTestId("message-create-forth").click();
    await expect(page.getByTestId("create-forth-modal")).toBeVisible();
    await page.getByTestId("forth-ticket-title").fill(`Ticket for ${rootMarker}`);
    await page.getByTestId("forth-ticket-assignee").selectOption("asha@conexus.local");
    await page.getByTestId("forth-ticket-submit").click();

    await expect(page.getByTestId("thread-panel")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("ticket-link-card")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId("ticket-link-card")).toContainText(
      `Ticket for ${rootMarker}`,
    );
    await expect(page.getByTestId("ticket-status")).toBeVisible();
  });

  test("unfurls a pasted Forth ticket URL into a TicketLink card", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/channels/general");
    await expect(page.getByTestId("channel-view")).toBeVisible({ timeout: 30_000 });

    const url = "https://forth-bice.vercel.app/t/fix-demo-1";
    const input = page.getByTestId("composer-input");
    await input.click();
    await input.fill("");
    await input.pressSequentially(`Unfurl please ${url}`, { delay: 5 });
    await page.getByTestId("composer-send").click();

    await expect(page.getByTestId("message-list").getByTestId("ticket-link-card")).toBeVisible({
      timeout: 45_000,
    });
    await expect(
      page.getByTestId("message-list").getByTestId("ticket-link-card").first(),
    ).toContainText(/Welcome|kickoff|checklist|Fixture|demo/i);
  });
});
