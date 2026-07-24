import { expect, test } from "@playwright/test";

const SEED_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@conexus.local";
const SEED_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "ConexusSeed!2026";

test.describe("Phase A Step 3 — auth", () => {
  test("unauthenticated / redirects to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId("login-page")).toBeVisible();
    await expect(page.getByTestId("google-signin")).toBeVisible();
    await expect(page.getByTestId("magic-link-submit")).toBeVisible();
  });

  test("login page shows Continue with Google as primary CTA", async ({ page }) => {
    await page.goto("/login");
    const google = page.getByTestId("google-signin");
    await expect(google).toBeVisible();
    await expect(google).toHaveText(/Continue with Google/i);
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

  test("not_allowlisted error copy matches PRD", async ({ page }) => {
    await page.goto("/login?error=not_allowlisted");
    await expect(page.getByTestId("login-error")).toHaveText(
      /Ask your facilitator for access/i,
    );
  });

  test("admin can open roster allowlist page", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("dev-email").fill(SEED_EMAIL);
    await page.getByTestId("dev-password").fill(SEED_PASSWORD);
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/"),
      page.getByTestId("dev-login-submit").click(),
    ]);
    await page.getByTestId("nav-roster").click();
    await expect(page).toHaveURL(/\/admin\/roster/);
    await expect(page.getByTestId("roster-admin")).toBeVisible();
    await expect(page.getByTestId("roster-upload")).toBeVisible();
  });
});
