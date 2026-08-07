import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/app-config";
import { getCreditsBalance } from "@/lib/ludwitt/data";
import { LudwittApiError } from "@/lib/ludwitt/client";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireSession();

    if (session.demo || isDemoMode()) {
      return NextResponse.json({
        user: session.user,
        scope: session.scope,
        demo: true,
        credits: {
          spendableCents: 0,
          spendableFormatted: "$0.00 (local demo)",
          balanceCents: 0,
          balanceFormatted: "$0.00",
        },
      });
    }

    const balance = await getCreditsBalance(session.accessToken);
    return NextResponse.json({
      user: session.user,
      scope: session.scope,
      demo: false,
      credits: balance,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof LudwittApiError) {
      return NextResponse.json(
        { error: error.error, message: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
