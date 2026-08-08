import { NextRequest, NextResponse } from "next/server";
import { isDemoMode } from "@/lib/app-config";
import { trackEvent } from "@/lib/events";
import { hasLudwittCredentials } from "@/lib/ludwitt/config";
import {
  buildAuthorizeUrl,
  createOAuthState,
  createPkcePair,
} from "@/lib/ludwitt/oauth";
import { createDemoSession, getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const session = await createDemoSession();
    try {
      await trackEvent(session.accessToken!, {
        eventType: "app_launch",
        userSub: session.user?.sub,
        properties: { source: "demo_login" },
      });
    } catch {
      /* ignore */
    }
    return NextResponse.redirect(new URL("/practice", request.url));
  }

  if (!hasLudwittCredentials()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Set DEMO_MODE=true, or add LUDWITT_CLIENT_ID / LUDWITT_CLIENT_SECRET in .env.local",
      },
      { status: 503 },
    );
  }

  const session = await getSession();
  const state = createOAuthState();
  const { verifier, challenge } = createPkcePair();

  session.oauthState = state;
  session.codeVerifier = verifier;
  await session.save();

  return NextResponse.redirect(buildAuthorizeUrl(state, challenge));
}
