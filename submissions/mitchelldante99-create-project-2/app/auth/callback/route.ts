import { NextRequest, NextResponse } from "next/server";
import { LUDWITT, TokenResponse, UserInfo } from "@/lib/ludwitt";
import { getOAuthFlowCookie, clearOAuthFlowCookie, setSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorParam)}`, LUDWITT.appBaseUrl)
    );
  }

  if (!code || !returnedState) {
    return NextResponse.redirect(new URL("/?error=missing_code_or_state", LUDWITT.appBaseUrl));
  }

  const flow = await getOAuthFlowCookie();
  if (!flow || flow.state !== returnedState) {
    return NextResponse.redirect(new URL("/?error=state_mismatch", LUDWITT.appBaseUrl));
  }

  // Server-to-server token exchange — client_secret never touches the browser
  const tokenRes = await fetch(LUDWITT.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: LUDWITT.redirectUri,
      client_id: LUDWITT.clientId,
      client_secret: LUDWITT.clientSecret,
      code_verifier: flow.codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    const body = await tokenRes.text();
    console.error("Ludwitt token exchange failed:", tokenRes.status, body);
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", LUDWITT.appBaseUrl));
  }

  const tokens = (await tokenRes.json()) as TokenResponse;

  const userRes = await fetch(LUDWITT.userinfoUrl, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/?error=userinfo_failed", LUDWITT.appBaseUrl));
  }

  const user = (await userRes.json()) as UserInfo;

  await setSession(tokens, user);
  await clearOAuthFlowCookie();

  return NextResponse.redirect(new URL("/", LUDWITT.appBaseUrl));
}
