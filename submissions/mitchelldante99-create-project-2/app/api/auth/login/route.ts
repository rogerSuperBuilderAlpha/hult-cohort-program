import { NextResponse } from "next/server";
import { LUDWITT } from "@/lib/ludwitt";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "@/lib/pkce";
import { setOAuthFlowCookie } from "@/lib/session";

export async function GET() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();

  await setOAuthFlowCookie(state, codeVerifier);

  const params = new URLSearchParams({
    client_id: LUDWITT.clientId,
    redirect_uri: LUDWITT.redirectUri,
    response_type: "code",
    scope: LUDWITT.scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return NextResponse.redirect(`${LUDWITT.authorizeUrl}?${params.toString()}`);
}
