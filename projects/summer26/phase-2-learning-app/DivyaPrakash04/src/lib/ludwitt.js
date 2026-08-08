import { getRequiredEnv } from "./env";

const baseUrl = "https://pitchrise.ludwitt.com";

export class LudwittError extends Error {
  constructor(status, body) {
    super(body?.error_description || body?.error || "Ludwitt request failed");
    this.status = status;
    this.body = body;
  }
}

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new LudwittError(response.status, body);
  return body;
}

function clientCredentials() {
  const { LUDWITT_CLIENT_ID, LUDWITT_CLIENT_SECRET, LUDWITT_REDIRECT_URI } = getRequiredEnv();
  return { LUDWITT_CLIENT_ID, LUDWITT_CLIENT_SECRET, LUDWITT_REDIRECT_URI };
}

export function getAuthorizeUrl({ state, codeChallenge }) {
  const { LUDWITT_CLIENT_ID, LUDWITT_REDIRECT_URI } = clientCredentials();
  const url = new URL(`${baseUrl}/oauth/authorize`);
  url.search = new URLSearchParams({
    client_id: LUDWITT_CLIENT_ID,
    redirect_uri: LUDWITT_REDIRECT_URI,
    response_type: "code",
    scope: "profile credits:read credits:spend",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  }).toString();
  return url.toString();
}

async function postToken(parameters) {
  const response = await fetch(`${baseUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    cache: "no-store",
    body: new URLSearchParams(parameters),
  });
  return parseResponse(response);
}

export async function exchangeAuthorizationCode({ code, verifier }) {
  const { LUDWITT_CLIENT_ID, LUDWITT_CLIENT_SECRET, LUDWITT_REDIRECT_URI } = clientCredentials();
  return postToken({ grant_type: "authorization_code", code, redirect_uri: LUDWITT_REDIRECT_URI, client_id: LUDWITT_CLIENT_ID, client_secret: LUDWITT_CLIENT_SECRET, code_verifier: verifier });
}

export async function refreshAccessToken(refreshToken) {
  const { LUDWITT_CLIENT_ID, LUDWITT_CLIENT_SECRET } = clientCredentials();
  return postToken({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: LUDWITT_CLIENT_ID, client_secret: LUDWITT_CLIENT_SECRET });
}

export async function getUserInfo(accessToken) {
  const response = await fetch(`${baseUrl}/api/oauth/userinfo`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
  return parseResponse(response);
}

export async function getCreditBalance(accessToken) {
  const response = await fetch(`${baseUrl}/api/v1/credits/balance`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" });
  return parseResponse(response);
}

export async function askTutor(accessToken, prompt) {
  const response = await fetch(`${baseUrl}/api/v1/ai/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 350,
      system: "You are PyByte, a concise and encouraging Python tutor. Explain concepts with small Python examples.",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  return parseResponse(response);
}
