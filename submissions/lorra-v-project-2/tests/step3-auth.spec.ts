import { expect, test } from "@playwright/test";

const SEED_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@conexus.local";
const SEED_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "ConexusSeed!2026";

test.describe("Phase A Step 3 — auth", () => {
  test("unauthenticated / redirects to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-page")).toBeVisible();
    await expect(page.getByTestId("google-signin")).toBeVisible();
    await expect(page.getByTestId("github-signin")).toBeVisible();
    await expect(page.getByTestId("magic-link-submit")).toBeVisible();
  });

  test("login page shows Google and GitHub SSO CTAs", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("google-signin")).toHaveText(/Continue with Google/i);
    await expect(page.getByTestId("github-signin")).toHaveText(/Continue with GitHub/i);
    await expect(page.getByTestId("login-page")).not.toContainText(/roster allowlist/i);
    await expect(page.getByTestId("login-page")).toContainText(/no invite required/i);
  });

  test("seed admin password login reaches home and shows profile", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("dev-login-submit")).toBeVisible();
    await page.getByTestId("dev-email").fill(SEED_EMAIL);
    await page.getByTestId("dev-password").fill(SEED_PASSWORD);
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.getByTestId("dev-login-submit").click(),
    ]);
    await expect(page.getByTestId("home-digest")).toBeVisible();
    await expect(page.getByTestId("shell-user-name")).toBeVisible();
    await expect(page.getByTestId("nav-roster")).toBeVisible();
  });

  test("invalid seed password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("dev-email").fill(SEED_EMAIL);
    await page.getByTestId("dev-password").fill("wrong-password");
    await page.getByTestId("dev-login-submit").click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-error")).toBeVisible();
  });

  test("admin can open cohort directory page", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("dev-email").fill(SEED_EMAIL);
    await page.getByTestId("dev-password").fill(SEED_PASSWORD);
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.getByTestId("dev-login-submit").click(),
    ]);
    await expect(page.getByTestId("nav-roster")).toBeVisible();
    await page.goto("/admin/roster");
    await expect(page).toHaveURL(/\/admin\/roster/);
    await expect(page.getByTestId("roster-admin")).toBeVisible();
    await expect(page.getByTestId("roster-upload")).toBeVisible();
    await expect(page.getByTestId("roster-admin")).toContainText(/does not gate access/i);
  });
});
