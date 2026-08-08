import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    // Send to /launch with no token → rejection screen ("Launch from Ludwitt/Hult").
    // /launch is not matched by this middleware, so this cannot loop.
    return NextResponse.redirect(new URL("/launch", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/paths", "/paths/:path*"],
};
