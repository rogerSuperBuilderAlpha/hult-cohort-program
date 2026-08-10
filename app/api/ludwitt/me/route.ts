import { NextResponse } from "next/server";
import { fetchCreditBalance, getSessionUser } from "@/lib/ludwitt/client";
import { LUDWITT_URLS } from "@/lib/ludwitt/config";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    let balance = null;
    try {
      balance = await fetchCreditBalance();
    } catch {
      balance = null;
    }

    return NextResponse.json({
      authenticated: true,
      user,
      balance,
      topUpUrl: LUDWITT_URLS.topUp,
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : "Session error",
      },
      { status: 500 },
    );
  }
}
