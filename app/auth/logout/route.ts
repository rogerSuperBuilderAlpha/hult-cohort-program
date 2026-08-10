import { NextRequest, NextResponse } from "next/server";
import { revokeToken } from "@/lib/ludwitt/oauth";
import { clearSession, readSession } from "@/lib/ludwitt/session";

export async function GET(request: NextRequest) {
  const session = await readSession();
  if (session) {
    await revokeToken(session.accessToken);
    await revokeToken(session.refreshToken);
  }
  await clearSession();
  return NextResponse.redirect(new URL("/", request.url));
}

export async function POST(request: NextRequest) {
  return GET(request);
}
