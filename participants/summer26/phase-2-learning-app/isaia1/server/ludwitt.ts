import {
  LUDWITT_AI_MESSAGES_URL,
  LUDWITT_CREDITS_BALANCE_URL,
  LUDWITT_REVOKE_URL,
  LUDWITT_TOKEN_URL,
  LUDWITT_USERINFO_URL,
  getClientSecret,
} from './config';
import type {
  LudwittCreditsBalance,
  LudwittSession,
  LudwittTokenResponse,
  LudwittUserInfo,
} from './types';

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || `Ludwitt request failed (${res.status})`);
  }
}

export async function exchangeAuthorizationCode(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<LudwittTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: 'le_c4ad1bb389677060475555',
    client_secret: getClientSecret(),
    code_verifier: codeVerifier,
  });

  const res = await fetch(LUDWITT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const err = await parseJson<{ error?: string; error_description?: string }>(res);
    throw new Error(err.error_description ?? err.error ?? 'Token exchange failed.');
  }

  return parseJson<LudwittTokenResponse>(res);
}

export async function refreshAccessToken(refreshToken: string): Promise<LudwittTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: 'le_c4ad1bb389677060475555',
    client_secret: getClientSecret(),
  });

  const res = await fetch(LUDWITT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const err = await parseJson<{ error?: string; error_description?: string }>(res);
    throw new Error(err.error_description ?? err.error ?? 'Token refresh failed.');
  }

  return parseJson<LudwittTokenResponse>(res);
}

export async function fetchUserInfo(accessToken: string): Promise<LudwittUserInfo> {
  const res = await fetch(LUDWITT_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await parseJson<{ error?: string; error_description?: string }>(res);
    throw new Error(err.error_description ?? err.error ?? 'Failed to load user profile.');
  }

  return parseJson<LudwittUserInfo>(res);
}

export async function revokeToken(token: string): Promise<void> {
  const body = new URLSearchParams({ token });
  await fetch(LUDWITT_REVOKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

export async function fetchCreditsBalance(accessToken: string): Promise<LudwittCreditsBalance> {
  const res = await fetch(LUDWITT_CREDITS_BALANCE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await parseJson<{ error?: string; error_description?: string }>(res);
    throw new Error(err.error_description ?? err.error ?? 'Failed to load credit balance.');
  }

  return parseJson<LudwittCreditsBalance>(res);
}

export async function sendAiMessage(
  accessToken: string,
  payload: { model?: string; max_tokens?: number; messages: { role: string; content: string }[]; system?: string },
): Promise<{ data: unknown; status: number }> {
  const res = await fetch(LUDWITT_AI_MESSAGES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: payload.model ?? 'claude-sonnet-4-6',
      max_tokens: payload.max_tokens ?? 1024,
      messages: payload.messages,
      ...(payload.system ? { system: payload.system } : {}),
    }),
  });

  const data = await parseJson<unknown>(res);
  return { data, status: res.status };
}

export function sessionFromTokens(
  user: LudwittUserInfo,
  tokens: LudwittTokenResponse,
): LudwittSession {
  return {
    sub: user.sub,
    email: user.email,
    name: user.name ?? null,
    picture: user.picture ?? null,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000 - 60_000,
  };
}

export async function ensureFreshSession(session: LudwittSession): Promise<LudwittSession> {
  if (Date.now() < session.expiresAt) return session;
  const tokens = await refreshAccessToken(session.refreshToken);
  return {
    ...session,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000 - 60_000,
  };
}

export function publicUser(session: LudwittSession) {
  return {
    id: session.sub,
    email: session.email,
    name: session.name,
    picture: session.picture,
    provider: 'ludwitt' as const,
  };
}
