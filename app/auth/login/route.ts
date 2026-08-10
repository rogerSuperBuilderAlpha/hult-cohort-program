import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from "@/lib/ludwitt/config";
import {
  buildAuthorizeUrl,
  createOAuthState,
  createPkcePair,
} from "@/lib/ludwitt/oauth";

export async function GET() {
  const state = createOAuthState();
  const { verifier, challenge } = createPkcePair();
  const jar = await cookies();

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };

  jar.set(OAUTH_STATE_COOKIE, state, cookieOpts);
  jar.set(OAUTH_VERIFIER_COOKIE, verifier, cookieOpts);

  return NextResponse.redirect(buildAuthorizeUrl(state, challenge));
}
