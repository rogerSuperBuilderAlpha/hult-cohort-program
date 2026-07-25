import { expect, test } from "@playwright/test";

test.describe("Public landing page", () => {
  test("unauthenticated visitor sees landing and Get Started reaches login providers", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("landing-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Conexus" })).toBeVisible();
    await expect(page.getByTestId("landing-features")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/login/),
      page.getByTestId("landing-hero-cta").click(),
    ]);

    await expect(page.getByTestId("login-page")).toBeVisible();
    await expect(page.getByTestId("google-signin")).toBeVisible();
    await expect(page.getByTestId("github-signin")).toBeVisible();
  });
});
