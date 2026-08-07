import { NextRequest, NextResponse } from "next/server";
import { verifyLaunchToken, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/?error=no-token", req.url));
  }

  const user = await verifyLaunchToken(token);
  if (!user) {
    return NextResponse.redirect(new URL("/?error=invalid-token", req.url));
  }

  const session = await createSessionToken(user);
  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set(SESSION_COOKIE_NAME, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}