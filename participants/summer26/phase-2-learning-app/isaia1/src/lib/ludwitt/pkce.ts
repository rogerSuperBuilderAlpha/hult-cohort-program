export const LUDWITT_CLIENT_ID = 'le_c4ad1bb389677060475555';
export const LUDWITT_AUTHORIZE_URL = 'https://pitchrise.ludwitt.com/oauth/authorize';
export const LUDWITT_REDIRECT_URI =
  import.meta.env.VITE_LUDWITT_REDIRECT_URI ?? 'https://localhost:3000/auth/callback';
export const LUDWITT_SCOPES = 'profile credits:read credits:spend';
export const LUDWITT_TOP_UP_URL = 'https://pitchrise.ludwitt.com/account/credits';

export const PKCE_VERIFIER_KEY = 'ludwitt_pkce_verifier';

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomVerifier(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return base64UrlEncode(bytes.buffer);
}

export async function createPkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = randomVerifier();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  const codeChallenge = base64UrlEncode(digest);
  return { codeVerifier, codeChallenge };
}

export function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: LUDWITT_CLIENT_ID,
    redirect_uri: LUDWITT_REDIRECT_URI,
    response_type: 'code',
    scope: LUDWITT_SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${LUDWITT_AUTHORIZE_URL}?${params.toString()}`;
}
