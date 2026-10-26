import { NextResponse } from "next/server";
import { fetchCreditBalance, LUDWITT_TOP_UP_URL } from "@/lib/ludwitt/credits";
import { requireAccessToken } from "@/lib/ludwitt/tokens";

export async function GET() {
  const auth = await requireAccessToken();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await fetchCreditBalance(auth.accessToken);
  if (!balance) {
    return NextResponse.json({ error: "Could not load balance" }, { status: 502 });
  }

  return NextResponse.json({ ...balance, topUpUrl: LUDWITT_TOP_UP_URL });
}
