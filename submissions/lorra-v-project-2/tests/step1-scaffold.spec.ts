import { expect, test } from "@playwright/test";

/**
 * Step 1 smoke: scaffold loads with Manrope, §8 tokens, and §5 sidebar nav.
 */
test.describe("Phase A Step 1 — scaffold", () => {
  test("home shell renders Conexus brand, sidebar, and design tokens", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByTestId("app-sidebar")).toBeVisible();
    await expect(page.getByText("Conexus").first()).toBeVisible();
    await expect(page.getByTestId("home-digest")).toBeVisible();
    await expect(page.getByTestId("nav-home")).toBeVisible();
    await expect(page.getByTestId("nav-messages")).toBeVisible();
    await expect(page.getByTestId("nav-threads")).toBeVisible();
    await expect(page.getByTestId("nav-tasks")).toBeVisible();
    await expect(page.getByTestId("nav-files")).toBeVisible();

    // Manrope loaded via next/font
    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
    expect(fontFamily.toLowerCase()).toContain("manrope");

    // §8 primary teal token present on :root
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
    await page.goto("/");

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
    await page.goto("/");
    await Promise.all([
      page.waitForURL(/\/channels\/general$/),
      page.getByTestId("channel-link-general").click(),
    ]);
    await expect(page.getByTestId("channel-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "#general" })).toBeVisible();
  });
});
