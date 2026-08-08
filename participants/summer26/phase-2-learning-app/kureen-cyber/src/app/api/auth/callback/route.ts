import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/events";
import {
  exchangeCode,
  fetchUserInfo,
} from "@/lib/ludwitt/oauth";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(oauthError)}`, request.url),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=missing_code", request.url));
  }

  const session = await getSession();
  if (!session.oauthState || session.oauthState !== state || !session.codeVerifier) {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url));
  }

  try {
    const tokens = await exchangeCode(code, session.codeVerifier);
    const user = await fetchUserInfo(tokens.access_token);

    session.isLoggedIn = true;
    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.expiresAt =
      Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600);
    session.scope = tokens.scope;
    session.user = user;
    session.oauthState = undefined;
    session.codeVerifier = undefined;
    await session.save();

    // Non-heartbeat launch event → hosted-data `Events` collection
    try {
      await trackEvent(tokens.access_token, {
        eventType: "app_launch",
        userSub: user.sub,
        properties: {
          source: "oauth_callback",
          scope: tokens.scope ?? "",
        },
      });
    } catch {
      // Auth succeeded even if event write fails; surface later in practice UI
    }

    return NextResponse.redirect(new URL("/practice", request.url));
  } catch {
    return NextResponse.redirect(new URL("/?error=token_exchange", request.url));
  }
}
