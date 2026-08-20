import { NextResponse } from 'next/server';
import { fetchUserInfo, oauthConfig } from '@/lib/ludwitt/oauth';
import { attachSessionCookie, createLearnerSession } from '@/lib/ludwitt/session';
import { emitVentureEvent } from '@/lib/ludwitt/events';
import { ludwittTransport } from '@/lib/ludwitt/session';

export const dynamic = 'force-dynamic';

/** Session from a Creator "Mint test token" (starts with lt_). */
export async function POST(request: Request) {
  let body: { access_token?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const accessToken = typeof body.access_token === 'string' ? body.access_token.trim() : '';
  if (!accessToken.startsWith('lt_')) {
    return NextResponse.json(
      { error: 'Creator test token required (starts with lt_)' },
      { status: 400 }
    );
  }

  const userinfo = await fetchUserInfo(accessToken);
  if (!userinfo.ok) {
    return NextResponse.json({ error: userinfo.error }, { status: 401 });
  }

  const clientId = oauthConfig().clientId || 'ludwitt';
  const session = createLearnerSession({
    sub: userinfo.user.sub,
    email: userinfo.user.email,
    app_id: process.env.LUDWITT_APP_ID?.trim() || clientId,
  });

  const res = NextResponse.json({
    ok: true,
    email: userinfo.user.email,
    sub: userinfo.user.sub,
  });
  attachSessionCookie(res, session);

  try {
    await emitVentureEvent(
      'authenticated_session_started',
      { userId: session.sub, sessionId: session.sessionId },
      'ok',
      ludwittTransport
    );
  } catch {
    /* ignore */
  }

  return res;
}
