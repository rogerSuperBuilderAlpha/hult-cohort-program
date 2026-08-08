import { NextResponse } from "next/server";
import { cookieOptions, createOAuthState, createPkcePair, oauthStateCookieName } from "@/lib/auth";
import { getAuthorizeUrl } from "@/lib/ludwitt";

export async function GET(request) {
  try {
    const { verifier, challenge } = createPkcePair();
    const { state, cookieValue } = await createOAuthState(verifier);
    const response = NextResponse.redirect(getAuthorizeUrl({ state, codeChallenge: challenge }));
    response.cookies.set(oauthStateCookieName, cookieValue, cookieOptions(60 * 10));
    return response;
  } catch {
    return new Response("Unable to start Ludwitt sign-in", { status: 500 });
  }
}
