import { NextResponse } from "next/server";
import { ENROLLED } from "@cohort/core/cohort";

/**
 * Rally-specific liveness + feature-probe surface.
 *
 * A deploy's smoke test proving the root page loads does NOT prove a FRESH deploy landed
 * (memory pulse-deploy-mechanism). This route is the feature-probe: it returns Rally's own
 * shape — `app: "rally"`, the enrolled count from @cohort/core, and a build marker — so the
 * loop can assert the new code is actually live, not a stale cache. GET is 200; a POST with a
 * malformed body is a deliberate 400 (not 404), which also confirms the route exists.
 */
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    app: "rally",
    ok: true,
    enrolled: ENROLLED,
    build: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ app: "rally", error: "invalid_json" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || !("ping" in body)) {
    return NextResponse.json({ app: "rally", error: "missing_ping" }, { status: 400 });
  }
  return NextResponse.json({ app: "rally", pong: true });
}
