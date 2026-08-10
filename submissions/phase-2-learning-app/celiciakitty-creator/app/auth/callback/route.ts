import { NextResponse } from "next/server";

import {
  clearOAuthTransientCookies,
  readOAuthTransientCookies,
} from "@/lib/ludwitt/cookies";
import { createSessionFromAuthCode } from "@/lib/ludwitt/session";

function errorRedirect(request: Request, reason: string): NextResponse {
  const url = new URL("/auth/error", request.url);
  url.searchParams.set("reason", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");

  if (error) {
    await clearOAuthTransientCookies();
    const redirectUrl = new URL("/auth/error", request.url);
    redirectUrl.searchParams.set("reason", error === "access_denied" ? "denied" : "oauth");
    return NextResponse.redirect(redirectUrl);
  }

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  if (!code || !returnedState) {
    await clearOAuthTransientCookies();
    return errorRedirect(request, "missing_params");
  }

  const { state: storedState, codeVerifier, returnTo } =
    await readOAuthTransientCookies();
  await clearOAuthTransientCookies();

  if (!storedState || !codeVerifier) {
    return errorRedirect(request, "session_expired");
  }

  if (returnedState !== storedState) {
    return errorRedirect(request, "state_mismatch");
  }

  try {
    await createSessionFromAuthCode(code, codeVerifier);
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch {
    return errorRedirect(request, "token_exchange");
  }
}
