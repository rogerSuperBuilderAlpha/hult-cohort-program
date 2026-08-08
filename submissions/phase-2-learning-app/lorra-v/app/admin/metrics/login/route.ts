import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "ef_admin_metrics";

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_METRICS_PASSWORD;
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  if (!expected || password !== expected) {
    return NextResponse.redirect(
      new URL("/admin/metrics?error=1", request.url),
      { status: 303 },
    );
  }

  const res = NextResponse.redirect(new URL("/admin/metrics", request.url), {
    status: 303,
  });
  res.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin/metrics",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
