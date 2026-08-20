import { compactVerify, decodeJwt, decodeProtectedHeader } from 'jose';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import type { NextResponse } from 'next/server';

export const SESSION_COOKIE = 'energy_auditor_session';

export type LaunchPayload = {
  sub: string;
  email: string;
  app_id: string;
};

export type LearnerSession = LaunchPayload & {
  sessionId: string;
  name?: string;
  companyName?: string;
  username?: string;
};

function secretKey() {
  const secret = process.env.LUDWITT_JWT_SECRET?.trim();
  if (!secret) throw new Error('LUDWITT_JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

/** Launch JWT: verify signature; ignore JWT `exp`; cap age from `iat` (48h default). */
export async function verifyLaunchToken(token: string): Promise<LaunchPayload> {
  const header = decodeProtectedHeader(token);
  if (header.alg !== 'HS256') throw new Error('unsupported JWT algorithm');

  await compactVerify(token, secretKey());

  const payload = decodeJwt(token);
  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  const email = typeof payload.email === 'string' ? payload.email : '';
  const app_id = typeof payload.app_id === 'string' ? payload.app_id : '';
  if (!sub || !email || !app_id) throw new Error('JWT missing required claims');

  const iat = typeof payload.iat === 'number' ? payload.iat : 0;
  if (iat > 0) {
    const ageSec = Math.floor(Date.now() / 1000) - iat;
    if (ageSec > launchSessionMaxAgeSec()) {
      throw new Error('launch token expired');
    }
  }

  const expectedAppId = process.env.LUDWITT_APP_ID?.trim();
  if (expectedAppId && app_id !== expectedAppId) throw new Error('JWT app_id mismatch');
  return { sub, email, app_id };
}

export function createLearnerSession(
  partial: LaunchPayload & {
    sessionId?: string;
    name?: string;
    companyName?: string;
    username?: string;
  }
): LearnerSession {
  return { ...partial, sessionId: partial.sessionId ?? randomUUID() };
}

export function launchSessionMaxAgeSec(): number {
  const configured = parseInt(
    process.env.LAUNCH_SESSION_HOURS || process.env.EVENT_SESSION_HOURS || '48',
    10
  );
  return Math.max(1, configured) * 60 * 60;
}

export function sessionCookieOptions(maxAgeSec = launchSessionMaxAgeSec()) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec,
  };
}

export function attachSessionCookie(response: NextResponse, session: LearnerSession) {
  response.cookies.set(SESSION_COOKIE, JSON.stringify(session), sessionCookieOptions());
  return session;
}

export async function readSession(): Promise<LearnerSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LearnerSession;
    if (!parsed.sub || !parsed.sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function ludwittTransportConfig() {
  const appId = process.env.LUDWITT_APP_ID?.trim();
  const apiKey = process.env.LUDWITT_DEVELOPER_KEY?.trim() || process.env.LUDWITT_API_KEY?.trim();
  const baseUrl = (process.env.LUDWITT_API_BASE_URL || 'http://localhost:4000/v1').replace(/\/$/, '');
  if (!appId || !apiKey) throw new Error('Ludwitt not configured');
  return { appId, apiKey, baseUrl };
}

export async function ludwittTransport(
  platformEvent: string,
  userId: string,
  sessionId: string,
  metadata: Record<string, string>
) {
  const { appId, apiKey, baseUrl } = ludwittTransportConfig();
  const res = await fetch(`${baseUrl}/apps/${appId}/events`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: platformEvent, user_id: userId, session_id: sessionId, metadata }),
  });
  if (!res.ok) throw new Error(`Ludwitt event failed (${res.status}): ${await res.text()}`);
  return res.json();
}
