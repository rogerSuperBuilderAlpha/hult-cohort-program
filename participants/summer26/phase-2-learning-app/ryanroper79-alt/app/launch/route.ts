import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifyLaunchToken, postLearningEvent } from '@/lib/ludwitt-server';
import { SESSION_COOKIE, type LaunchPayload } from '@/lib/ludwitt-types';

function redirectHome(request: Request, query?: Record<string, string>) {
  const url = new URL('/', request.url);
  if (query) {
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

function setSessionCookie(response: NextResponse, payload: LaunchPayload) {
  const session = { ...payload, sessionId: randomUUID() };
  response.cookies.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 4,
  });
  return session;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token')?.trim();

  if (!token) {
    return redirectHome(request, { error: 'missing_token' });
  }

  try {
    const payload = await verifyLaunchToken(token);
    const response = redirectHome(request, { launched: '1' });
    const session = setSessionCookie(response, payload);
    try {
      await postLearningEvent('lesson_started', session.sub, session.sessionId, { source: 'launch' });
    } catch {
      // Keep session even if platform API is down.
    }
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid_token';
    return redirectHome(request, { error: message });
  }
}
