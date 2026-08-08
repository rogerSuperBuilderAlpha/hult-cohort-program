import {
  getLudwittClientId,
  getLudwittClientSecret,
  getLudwittRedirectUri,
  ludwittConfig,
} from "@/lib/ludwitt/config";

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export type UserInfoResponse = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
};

export type LudwittOAuthError = {
  error: string;
  error_description?: string;
};

async function parseOAuthError(
  response: Response
): Promise<LudwittOAuthError | null> {
  try {
    return (await response.json()) as LudwittOAuthError;
  } catch {
    return null;
  }
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getLudwittRedirectUri(),
    client_id: getLudwittClientId(),
    client_secret: getLudwittClientSecret(),
    code_verifier: codeVerifier,
  });

  const response = await fetch(ludwittConfig.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await parseOAuthError(response);
    throw new Error(
      err?.error_description ?? err?.error ?? "Token exchange failed"
    );
  }

  return (await response.json()) as TokenResponse;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: getLudwittClientId(),
    client_secret: getLudwittClientSecret(),
  });

  const response = await fetch(ludwittConfig.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await parseOAuthError(response);
    throw new Error(
      err?.error_description ?? err?.error ?? "Token refresh failed"
    );
  }

  return (await response.json()) as TokenResponse;
}

export async function fetchUserInfo(
  accessToken: string
): Promise<UserInfoResponse> {
  const response = await fetch(ludwittConfig.userinfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await parseOAuthError(response);
    throw new Error(
      err?.error_description ?? err?.error ?? "Userinfo request failed"
    );
  }

  return (await response.json()) as UserInfoResponse;
}

export async function revokeToken(token: string): Promise<void> {
  const body = new URLSearchParams({ token });

  await fetch(ludwittConfig.revokeUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
    cache: "no-store",
  });
}

export function buildAuthorizeUrl(
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    client_id: getLudwittClientId(),
    redirect_uri: getLudwittRedirectUri(),
    response_type: "code",
    scope: ludwittConfig.scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${ludwittConfig.authorizeUrl}?${params.toString()}`;
}
