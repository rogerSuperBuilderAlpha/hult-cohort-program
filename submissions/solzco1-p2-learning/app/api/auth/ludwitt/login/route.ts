import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ludwitt, ludwittConfigured } from "@/lib/config";
import { pkceChallenge, randomUrlSafe } from "@/lib/ludwitt/crypto";

const PKCE_COOKIE = "dealforge_pkce";
const STATE_COOKIE = "dealforge_oauth_state";

export async function GET() {
  if (!ludwittConfigured()) {
    return NextResponse.json(
      { error: "Ludwitt OAuth not configured. Set LUDWITT_CLIENT_ID and LUDWITT_CLIENT_SECRET." },
      { status: 503 }
    );
  }

  const verifier = randomUrlSafe(48);
  const state = randomUrlSafe(24);
  const challenge = pkceChallenge(verifier);

  cookies().set(PKCE_COOKIE, verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  cookies().set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: ludwitt.clientId,
    redirect_uri: ludwitt.redirectUri,
    response_type: "code",
    scope: ludwitt.scopes,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return NextResponse.redirect(`${ludwitt.authorizeUrl}?${params}`);
}
