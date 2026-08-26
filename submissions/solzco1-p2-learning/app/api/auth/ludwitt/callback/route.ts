import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ludwitt } from "@/lib/config";
import { newSessionId } from "@/lib/ludwitt/events";
import { setSession } from "@/lib/ludwitt/session";

const PKCE_COOKIE = "dealforge_pkce";
const STATE_COOKIE = "dealforge_oauth_state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${ludwitt.appUrl}/?auth_error=${encodeURIComponent(error)}`
    );
  }

  const expectedState = cookies().get(STATE_COOKIE)?.value;
  const verifier = cookies().get(PKCE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    return NextResponse.redirect(`${ludwitt.appUrl}/?auth_error=invalid_callback`);
  }

  cookies().delete(PKCE_COOKIE);
  cookies().delete(STATE_COOKIE);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: ludwitt.redirectUri,
    client_id: ludwitt.clientId,
    client_secret: ludwitt.clientSecret,
    code_verifier: verifier,
  });

  const tokenRes = await fetch(ludwitt.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${ludwitt.appUrl}/?auth_error=token_exchange_failed`);
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const userRes = await fetch(ludwitt.userinfoUrl, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(`${ludwitt.appUrl}/?auth_error=userinfo_failed`);
  }

  const user = (await userRes.json()) as {
    sub: string;
    email: string;
    name?: string;
  };

  await setSession({
    sub: user.sub,
    email: user.email,
    name: user.name,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpiresAt: tokens.expires_in
      ? Date.now() + tokens.expires_in * 1000
      : undefined,
    sessionId: newSessionId(),
    authMethod: "oauth",
  });

  return NextResponse.redirect(`${ludwitt.appUrl}/learn`);
}
