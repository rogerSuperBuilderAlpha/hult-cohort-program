import {
  LUDWITT_AUTHORIZE_URL,
  LUDWITT_CLIENT_ID,
  LUDWITT_SCOPES,
  REDIRECT_URI,
  getSessionSecret,
} from './config';
import { decryptJson, encryptJson, randomState } from './crypto';
import type { LudwittSession } from './types';
import type { ApiRequest, ApiResponse } from './types';

export const SESSION_COOKIE = 'ludwitt_session';
export const OAUTH_STATE_COOKIE = 'ludwitt_oauth_state';

const isProd = process.env.NODE_ENV === 'production';

function cookieFlags(maxAgeSeconds: number): string {
  const parts = [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

export function setOAuthStateCookie(res: ApiResponse, state: string): void {
  res.setHeader('Set-Cookie', `${OAUTH_STATE_COOKIE}=${state}; ${cookieFlags(600)}`);
}

export function clearOAuthStateCookie(res: ApiResponse): void {
  res.setHeader('Set-Cookie', `${OAUTH_STATE_COOKIE}=; ${cookieFlags(0)}`);
}

export function readCookie(req: ApiRequest, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  const cookies = header.split(';').map((part) => part.trim());
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function readOAuthState(req: ApiRequest): string | null {
  return readCookie(req, OAUTH_STATE_COOKIE);
}

export function setSessionCookie(res: ApiResponse, session: LudwittSession): void {
  const token = encryptJson(session, getSessionSecret());
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${token}; ${cookieFlags(60 * 60 * 24 * 30)}`);
}

export function clearSessionCookie(res: ApiResponse): void {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; ${cookieFlags(0)}`);
}

export function readSession(req: ApiRequest): LudwittSession | null {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return null;
  return decryptJson<LudwittSession>(token, getSessionSecret());
}

export function buildAuthorizeUrl(state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_id: LUDWITT_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: LUDWITT_SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${LUDWITT_AUTHORIZE_URL}?${params.toString()}`;
}

export function createOAuthState(): string {
  return randomState();
}

export function parseBody<T>(req: ApiRequest): T | null {
  if (!req.body) return null;
  try {
    return JSON.parse(req.body) as T;
  } catch {
    return null;
  }
}

export function sendJson(res: ApiResponse, status: number, body: unknown): void {
  res.status(status).json(body);
}
