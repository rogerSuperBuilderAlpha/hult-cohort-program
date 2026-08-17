import { NextResponse } from "next/server";
import { cookieOptions, createSession, oauthStateCookieName, readOAuthState, sessionCookieName } from "@/lib/auth";
import { exchangeAuthorizationCode, getUserInfo } from "@/lib/ludwitt";

function failedCallback(message, status = 400) {
  const response = new NextResponse(message, { status });
  response.cookies.set(oauthStateCookieName, "", { ...cookieOptions(0), maxAge: 0 });
  return response;
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = await readOAuthState(request);

  if (!code || !state || !savedState || state !== savedState.state) {
    return failedCallback("Unable to verify Ludwitt sign-in");
  }

  try {
    const tokens = await exchangeAuthorizationCode({ code, verifier: savedState.verifier });
    const profile = await getUserInfo(tokens.access_token);
    if (typeof profile.sub !== "string" || typeof profile.email !== "string") {
      return failedCallback("Unable to read Ludwitt profile");
    }

    const session = await createSession({ profile, tokens });
    const response = NextResponse.redirect(new URL("/learn", request.url));
    response.cookies.set(sessionCookieName, session, cookieOptions(60 * 60 * 24 * 30));
    response.cookies.set(oauthStateCookieName, "", { ...cookieOptions(0), maxAge: 0 });
    return response;
  } catch {
    return failedCallback("Ludwitt sign-in failed", 502);
  }
}
