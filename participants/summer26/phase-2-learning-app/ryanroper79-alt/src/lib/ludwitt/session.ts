import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'bidmanager_session';

export type LaunchPayload = {
  sub: string;
  email: string;
  app_id: string;
};

export type LearnerSession = LaunchPayload & {
  sessionId: string;
  orgId: string;
};

function secretKey() {
  const secret = process.env.LUDWITT_JWT_SECRET?.trim();
  if (!secret) throw new Error('LUDWITT_JWT_SECRET is not configured');
  return new TextEncoder().encode(secret);
}

export async function verifyLaunchToken(token: string): Promise<LaunchPayload> {
  const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  const email = typeof payload.email === 'string' ? payload.email : '';
  const app_id = typeof payload.app_id === 'string' ? payload.app_id : '';
  if (!sub || !email || !app_id) throw new Error('JWT missing required claims');
  const expectedAppId = process.env.LUDWITT_APP_ID?.trim();
  if (expectedAppId && app_id !== expectedAppId) throw new Error('JWT app_id mismatch');
  return { sub, email, app_id };
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
