import { NextResponse } from "next/server";
import { getPmSnapshot } from "@/lib/pm";

export async function GET() {
  const snapshot = await getPmSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
