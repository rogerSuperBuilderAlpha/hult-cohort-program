import { NextResponse } from "next/server";
import { revokeToken } from "@/lib/ludwitt/oauth";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  const token = session.refreshToken || session.accessToken;

  if (token) {
    try {
      await revokeToken(token);
    } catch {
      /* always clear local session */
    }
  }

  session.destroy();
  return NextResponse.json({ ok: true });
}
