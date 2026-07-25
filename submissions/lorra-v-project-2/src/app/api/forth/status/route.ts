import { NextResponse } from "next/server";
import { getPMAdapter, useForthFixtures } from "@/lib/forth";
import { getFixtureStoreSize } from "@/lib/forth/fixture-adapter";

export const runtime = "nodejs";

/** Adapter health for demos / smokes (no secrets). */
export async function GET() {
  const adapter = getPMAdapter();
  const fixtures = useForthFixtures();
  const sampleId = "fix-demo-1";
  const sample = await adapter.getTicket(sampleId);

  return NextResponse.json({
    ok: true,
    mode: fixtures ? "fixtures" : "live",
    forthBaseUrl:
      process.env.NEXT_PUBLIC_FORTH_BASE_URL || "https://forth-bice.vercel.app",
    sampleTicketUrl: adapter.getTicketUrl(sampleId),
    sampleTicketFound: Boolean(sample),
    fixtureStoreSize: fixtures ? getFixtureStoreSize() : null,
  });
}
