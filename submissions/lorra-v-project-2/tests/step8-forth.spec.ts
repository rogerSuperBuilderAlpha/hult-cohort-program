import { createHmac } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.DEV_ADMIN_EMAIL || "admin@conexus.local";
const SEED_PASSWORD = process.env.DEV_ADMIN_PASSWORD || "ConexusSeed!2026";
const WEBHOOK_SECRET =
  process.env.FORTH_WEBHOOK_SECRET || "conexus-forth-fixture-secret";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByTestId("dev-email").fill(ADMIN_EMAIL);
  await page.getByTestId("dev-password").fill(SEED_PASSWORD);
  await page.getByTestId("dev-login-submit").click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 20_000,
  });
}

test.describe.configure({ mode: "serial", timeout: 90_000 });

test.describe("Phase A Step 8 — Forth adapter", () => {
  test("status endpoint reports fixture mode and sample ticket URL", async ({
    request,
  }) => {
    const res = await request.get("/api/forth/status");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.mode).toBe("fixtures");
    expect(json.forthBaseUrl).toContain("forth-bice.vercel.app");
    expect(json.sampleTicketUrl).toMatch(/\/t\/fix-demo-1$/);
    expect(json.sampleTicketFound).toBe(true);
  });

  test("webhook rejects bad signature and accepts valid HMAC", async ({
    request,
  }) => {
    const payload = {
      event: "ticket.status_changed",
      previous_status: "open",
      ticket: {
        id: "fix-demo-1",
        title: "Welcome cohort kickoff checklist",
        status: "done",
        assignee_email: "asha@conexus.local",
        url: "https://forth-bice.vercel.app/t/fix-demo-1",
        updated_at: new Date().toISOString(),
      },
    };
    const raw = JSON.stringify(payload);

    const bad = await request.post("/api/webhooks/forth", {
      data: raw,
      headers: {
        "content-type": "application/json",
        "x-forth-signature": "sha256=deadbeef",
      },
    });
    expect(bad.status()).toBe(401);

    const sig = createHmac("sha256", WEBHOOK_SECRET).update(raw).digest("hex");
    const good = await request.post("/api/webhooks/forth", {
      data: raw,
      headers: {
        "content-type": "application/json",
        "x-forth-signature": `sha256=${sig}`,
      },
    });
    expect(good.ok()).toBeTruthy();
    const json = await good.json();
    expect(json.ok).toBe(true);
    expect(json.event).toBe("ticket.status_changed");
    expect(json.ticketId).toBe("fix-demo-1");
  });

  test("authenticated fixture create + poller", async ({ page, request }) => {
    await login(page);
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    const createRes = await request.post("/api/dev/forth-create", {
      headers: {
        cookie: cookieHeader,
        "content-type": "application/json",
      },
      data: {
        title: `step8-fixture-${Date.now()}`,
        assigneeEmail: "asha@conexus.local",
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    expect(created.ok).toBe(true);
    expect(created.ticket.id).toMatch(/^fix-/);
    expect(created.ticketLinkId).toBeTruthy();

    const poll = await request.post("/api/cron/poll-forth");
    expect(poll.ok()).toBeTruthy();
    const pollJson = await poll.json();
    expect(pollJson.ok).toBe(true);
    expect(typeof pollJson.checked).toBe("number");
  });
});
