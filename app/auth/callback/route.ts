import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from "@/lib/ludwitt/config";
import {
  exchangeAuthorizationCode,
  fetchUserinfo,
  sessionFromTokens,
} from "@/lib/ludwitt/oauth";
import { writeSession } from "@/lib/ludwitt/session";

function redirectHome(request: NextRequest, error?: string) {
  const url = new URL("/", request.url);
  if (error) url.searchParams.set("auth_error", error);
  else url.searchParams.set("auth", "ok");
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const oauthError = request.nextUrl.searchParams.get("error");

  if (oauthError) {
    return redirectHome(
      request,
      request.nextUrl.searchParams.get("error_description") || oauthError,
    );
  }

  if (!code || !state) {
    return redirectHome(request, "Missing authorization code or state");
  }

  const jar = await cookies();
  const expectedState = jar.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = jar.get(OAUTH_VERIFIER_COOKIE)?.value;

  jar.delete(OAUTH_STATE_COOKIE);
  jar.delete(OAUTH_VERIFIER_COOKIE);

  if (!expectedState || expectedState !== state) {
    return redirectHome(request, "Invalid OAuth state — please try signing in again");
  }
  if (!codeVerifier) {
    return redirectHome(request, "Missing PKCE verifier — please try signing in again");
  }

  try {
    const tokens = await exchangeAuthorizationCode(code, codeVerifier);
    const user = await fetchUserinfo(tokens.access_token);
    await writeSession(sessionFromTokens(tokens, user));
    return redirectHome(request);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ludwitt sign-in failed";
    return redirectHome(request, message);
  }
}
