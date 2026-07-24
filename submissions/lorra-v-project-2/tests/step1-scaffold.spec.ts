import { expect, test, type Page } from "@playwright/test";

const SEED_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@conexus.local";
const SEED_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "ConexusSeed!2026";

async function loginWithSeed(page: Page) {
  await page.goto("/login");
  await expect(page.getByTestId("login-page")).toBeVisible();
  await expect(page.getByTestId("dev-login-submit")).toBeVisible();
  await page.getByTestId("dev-email").fill(SEED_EMAIL);
  await page.getByTestId("dev-password").fill(SEED_PASSWORD);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login")),
    page.getByTestId("dev-login-submit").click(),
  ]);
}

/**
 * Step 1 smoke: scaffold loads with Manrope, §8 tokens, and §5 sidebar nav.
 * Requires seed login after Step 3 auth gate.
 */
test.describe("Phase A Step 1 — scaffold", () => {
  test("home shell renders Conexus brand, sidebar, and design tokens", async ({
    page,
  }) => {
    await loginWithSeed(page);

    await expect(page.getByTestId("app-sidebar")).toBeVisible();
    await expect(page.getByText("Conexus").first()).toBeVisible();
    await expect(page.getByTestId("home-digest")).toBeVisible();
    await expect(page.getByTestId("nav-home")).toBeVisible();
    await expect(page.getByTestId("nav-messages")).toBeVisible();
    await expect(page.getByTestId("nav-threads")).toBeVisible();
    await expect(page.getByTestId("nav-tasks")).toBeVisible();
    await expect(page.getByTestId("nav-files")).toBeVisible();

    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(fontFamily.toLowerCase()).toContain("manrope");

    const primary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim(),
    );
    expect(primary.toLowerCase()).toBe("#3cbbb1");

    const dark = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--color-dark").trim(),
    );
    expect(dark.toLowerCase()).toBe("#16324f");
  });

  test("sidebar navigates to Messages and Threads placeholders", async ({ page }) => {
    await loginWithSeed(page);

    await Promise.all([
      page.waitForURL(/\/messages$/),
      page.getByTestId("nav-messages").click(),
    ]);
    await expect(page.getByTestId("messages-page")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/threads$/),
      page.getByTestId("nav-threads").click(),
    ]);
    await expect(page.getByTestId("threads-page")).toBeVisible();
  });

  test("channel placeholder route opens from sidebar", async ({ page }) => {
    await loginWithSeed(page);
    await Promise.all([
      page.waitForURL(/\/channels\/general$/),
      page.getByTestId("channel-link-general").click(),
    ]);
    await expect(page.getByTestId("channel-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "#general" })).toBeVisible();
  });
});
