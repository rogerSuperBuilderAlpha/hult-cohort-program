import { NextResponse } from "next/server";

import { isLudwittConfigured } from "@/lib/ludwitt/config";
import { setOAuthTransientCookies } from "@/lib/ludwitt/cookies";
import { buildAuthorizeUrl } from "@/lib/ludwitt/oauth-client";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
} from "@/lib/ludwitt/pkce";

export async function GET(request: Request) {
  if (!isLudwittConfigured()) {
    return NextResponse.redirect(
      new URL("/auth/error?reason=config", request.url)
    );
  }

  try {
    const url = new URL(request.url);
    const returnTo = url.searchParams.get("returnTo") ?? undefined;
    const state = generateOAuthState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    await setOAuthTransientCookies(state, codeVerifier, returnTo);

    const authorizeUrl = buildAuthorizeUrl(state, codeChallenge);
    return NextResponse.redirect(authorizeUrl);
  } catch {
    return NextResponse.redirect(
      new URL("/auth/error?reason=login_start", request.url)
    );
  }
}
