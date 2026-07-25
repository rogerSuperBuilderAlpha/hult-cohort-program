import { NextResponse } from "next/server";
import { pollRecentTicketLinks } from "@/lib/forth/sync";
import { useForthFixtures } from "@/lib/forth";

export const runtime = "nodejs";

function authorize(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Local/dev: allow when fixtures are on and no secret configured
    return useForthFixtures();
  }
  const header = request.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

/**
 * Polling fallback for Forth ticket snapshots (PRD §7.3).
 * Call every ~2 minutes from cron / Vercel Cron.
 */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pollRecentTicketLinks();
    return NextResponse.json({ ok: true, fixtures: useForthFixtures(), ...result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Poll failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}
