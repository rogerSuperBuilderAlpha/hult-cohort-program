import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Step 2 smoke: §3 tables + seed (≥10 profiles, ≥3 channels) reachable via service role.
 */
test.describe("Phase A Step 2 — schema + seed", () => {
  test("verify-schema script reports OK", () => {
    const cwd = path.join(__dirname, "..");
    const output = execFileSync("node", ["scripts/verify-schema.mjs"], {
      cwd,
      encoding: "utf8",
      env: process.env,
    });
    expect(output).toContain("Schema + seed verification OK");
    const jsonLine = output
      .split(/\r?\n/)
      .map((l) => l.trim())
      .reverse()
      .find((l) => l.startsWith("{") && l.includes('"ok"'));
    expect(jsonLine).toBeTruthy();
    const summary = JSON.parse(jsonLine!);
    expect(summary.ok).toBe(true);
    expect(summary.profiles).toBeGreaterThanOrEqual(10);
    expect(summary.channels).toBeGreaterThanOrEqual(3);
  });

  test("GET /api/dev/schema-status returns ok with table counts", async ({
    request,
  }) => {
    const res = await request.get("/api/dev/schema-status");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.missing).toEqual([]);
    expect(body.counts.profiles).toBeGreaterThanOrEqual(10);
    expect(body.counts.channels).toBeGreaterThanOrEqual(3);
    expect(body.counts.messages).toBeGreaterThanOrEqual(1);
  });

  test("RLS helpers: anon cannot read profiles", async ({ request }) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    test.skip(!url || !anon, "Supabase env not loaded into Playwright");

    const res = await request.get(`${url}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        apikey: anon!,
        Authorization: `Bearer ${anon!}`,
      },
    });
    // Unauthenticated / anon role should be denied by RLS (empty or 401/403)
    if (res.ok()) {
      const rows = await res.json();
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBe(0);
    } else {
      expect([401, 403, 406]).toContain(res.status());
    }
  });
});
