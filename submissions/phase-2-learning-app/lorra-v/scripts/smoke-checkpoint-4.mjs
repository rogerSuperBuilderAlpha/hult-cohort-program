/**
 * A2.2 smoke: launch → Detachment → dilemma → KC≥80 → complete
 * Confirms path_completions does NOT fire until all 3 regarding-others disciplines done.
 *
 * Usage: node scripts/smoke-checkpoint-4.mjs
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { SignJWT } from "jose";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
config({ path: resolve(root, ".env.local") });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const results = [];

function log(step, ok, detail = "") {
  results.push({ step, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${step}${detail ? ` — ${detail}` : ""}`);
}

async function launchToken() {
  const secret = process.env.LUDWITT_JWT_SECRET;
  const appId = process.env.LUDWITT_APP_ID;
  if (!secret || !appId) throw new Error("missing LUDWITT_JWT_SECRET or LUDWITT_APP_ID");
  const sub = `smoke-a22-${Date.now()}`;
  const token = await new SignJWT({
    sub,
    email: "smoke-a22@example.com",
    app_id: appId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(secret));
  return { token, sub };
}

async function answerScenario(page, optionKey) {
  await page.locator(`input[type="radio"][value="${optionKey}"]`).first().check();
  await page.getByRole("button", { name: /Submit answer|Update answer/i }).first().click();
  await page.waitForTimeout(800);
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  const { count: pathBefore } = await supabase
    .from("path_completions")
    .select("*", { count: "exact", head: true });

  const metricsBase = (
    process.env.LUDWITT_API_BASE_URL || "http://localhost:4000/v1"
  ).replace(/\/$/, "");
  const metricsBeforeRes = await fetch(
    `${metricsBase}/apps/${process.env.LUDWITT_APP_ID}/metrics`,
    { headers: { Authorization: `Bearer ${process.env.LUDWITT_API_KEY}` } },
  );
  const metricsBefore = await metricsBeforeRes.json();
  log(
    "baseline",
    metricsBeforeRes.ok,
    `qualified=${metricsBefore.qualified_users} path_completions=${pathBefore}`,
  );

  const { token } = await launchToken();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${SITE}/launch?token=${token}`, { waitUntil: "networkidle" });
    log("launch → /paths", page.url().includes("/paths"), `url=${page.url()}`);

    const pathsHtml = await page.content();
    log(
      "paths shows Detachment full module",
      pathsHtml.includes("Detachment") && pathsHtml.includes("Full module"),
    );

    await page.goto(`${SITE}/paths/regarding-others/detachment`, {
      waitUntil: "networkidle",
    });
    log(
      "open Detachment",
      page.url().includes("/detachment"),
      `url=${page.url()}`,
    );

    await page.waitForTimeout(1200);
    await page.getByRole("button", { name: /Mark content as viewed/i }).click();
    await page.waitForTimeout(800);
    log("mark content viewed", true);

    // Opening dilemma is first scenario — choose C
    const dilemmaRadios = page.locator('article').filter({ hasText: "Opening dilemma" });
    await dilemmaRadios.locator('input[type="radio"][value="C"]').check();
    await dilemmaRadios.getByRole("button", { name: /Submit answer|Update answer/i }).click();
    await page.waitForTimeout(1000);
    log("submit dilemma C", true);

    // Knowledge checks: B, C, B, C
    const kcKeys = ["B", "C", "B", "C"];
    const kcArticles = page.locator("article").filter({ hasText: "Knowledge check" });
    const kcCount = await kcArticles.count();
    log("found 4 knowledge checks", kcCount === 4, `count=${kcCount}`);
    for (let i = 0; i < Math.min(kcCount, kcKeys.length); i++) {
      const article = kcArticles.nth(i);
      await article.locator(`input[type="radio"][value="${kcKeys[i]}"]`).check();
      await article.getByRole("button", { name: /Submit answer|Update answer/i }).click();
      await page.waitForTimeout(900);
    }
    log("submit knowledge checks (all correct)", true);

    const bodyAfterKc = await page.content();
    log(
      "knowledge score ≥ 80 shown",
      bodyAfterKc.includes("100%") || bodyAfterKc.includes("80%"),
      bodyAfterKc.includes("100%") ? "100%" : "check UI",
    );

    const completeBtn = page.getByRole("button", { name: /Complete module/i });
    await expectEnabled(completeBtn);
    await completeBtn.click();
    await page.waitForTimeout(1500);
    const afterComplete = await page.content();
    log(
      "complete module",
      afterComplete.includes("Module completed") ||
        afterComplete.includes("lesson_completed"),
    );

    const { count: pathAfter } = await supabase
      .from("path_completions")
      .select("*", { count: "exact", head: true });
    const pathDelta = (pathAfter ?? 0) - (pathBefore ?? 0);
    log(
      "path_completions unchanged (needs all 3 regarding-others)",
      pathDelta === 0,
      `before=${pathBefore} after=${pathAfter} delta=${pathDelta}`,
    );

    const metricsAfterRes = await fetch(
      `${metricsBase}/apps/${process.env.LUDWITT_APP_ID}/metrics`,
      { headers: { Authorization: `Bearer ${process.env.LUDWITT_API_KEY}` } },
    );
    const metricsAfter = await metricsAfterRes.json();
    log(
      "Ludwitt qualified_users moved",
      (metricsAfter.qualified_users ?? 0) > (metricsBefore.qualified_users ?? 0),
      `before=${metricsBefore.qualified_users} after=${metricsAfter.qualified_users}`,
    );

    // Landing is public
    await page.goto(SITE, { waitUntil: "networkidle" });
    const home = await page.content();
    log(
      "landing shows attribution + premise",
      home.includes("Human judgment becomes the constraint") &&
        home.includes("Jon C. Jenkins"),
    );
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n--- summary ---");
  console.log(`passed ${results.length - failed.length}/${results.length}`);
  if (failed.length) process.exitCode = 1;
}

async function expectEnabled(locator) {
  for (let i = 0; i < 10; i++) {
    if (await locator.isEnabled()) return;
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error("Complete module button never enabled");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
