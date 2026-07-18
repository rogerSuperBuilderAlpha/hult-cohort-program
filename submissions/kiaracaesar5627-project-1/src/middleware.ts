import { NextResponse, type NextRequest } from "next/server";
import { LAST_WORKSPACE_COOKIE } from "@/lib/theme";

export function middleware(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/w\/([^/]+)/);
  if (!match) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(LAST_WORKSPACE_COOKIE, match[1], {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/w/:id", "/w/:id/:path*"],
};
