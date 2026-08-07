import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ef_admin_metrics";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/metrics", request.url), {
    status: 303,
  });
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/metrics",
    maxAge: 0,
  });
  return res;
}
