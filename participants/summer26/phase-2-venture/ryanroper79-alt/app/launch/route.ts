import { NextResponse } from 'next/server';
import { verifyLaunchToken, attachSessionCookie, createLearnerSession } from '@/lib/ludwitt/session';
import { emitVentureEvent } from '@/lib/ludwitt/events';
import { ludwittTransport } from '@/lib/ludwitt/session';
import { siteOrigin } from '@/lib/site';

function redirectHome(request: Request, query?: Record<string, string>) {
  const origin = siteOrigin() || new URL(request.url).origin;
  const url = new URL('/', origin);
  if (query) for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

function redirectError(request: Request, reason: string) {
  const origin = siteOrigin() || new URL(request.url).origin;
  return NextResponse.redirect(
    new URL(`/launch/error?reason=${encodeURIComponent(reason)}`, origin)
  );
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')?.trim();
  if (!token) return redirectError(request, 'missing_token');

  try {
    const payload = await verifyLaunchToken(token);
    const session = createLearnerSession(payload);
    const response = redirectHome(request, { launched: '1' });
    attachSessionCookie(response, session);
    try {
      await emitVentureEvent(
        'authenticated_session_started',
        { userId: session.sub, sessionId: session.sessionId },
        'ok',
        ludwittTransport
      );
    } catch {
      /* session valid even if Ludwitt unreachable */
    }
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid_token';
    return redirectError(request, message);
  }
}
