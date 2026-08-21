import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  exchangeAuthorizationCode,
  fetchUserInfo,
  OAUTH_STATE_COOKIE,
  oauthConfig,
  oauthCookieOptions,
} from '@/lib/ludwitt/oauth';
import { attachSessionCookie, createLearnerSession } from '@/lib/ludwitt/session';
import { emitVentureEvent } from '@/lib/ludwitt/events';
import { ludwittTransport } from '@/lib/ludwitt/session';
import { siteOrigin } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = siteOrigin() || url.origin;
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const err = url.searchParams.get('error');

  if (err) {
    return NextResponse.redirect(
      new URL(`/launch/error?reason=${encodeURIComponent(`oauth_${err}`)}`, origin)
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL('/launch/error?reason=oauth_missing_code', origin));
  }

  const jar = await cookies();
  const stateCookie = jar.get(OAUTH_STATE_COOKIE)?.value;
  if (!stateCookie || stateCookie !== state) {
    return NextResponse.redirect(new URL('/launch/error?reason=oauth_state_mismatch', origin));
  }

  const redirectUri = `${origin}/auth/callback`;
  const exchanged = await exchangeAuthorizationCode({ code, redirectUri });
  if (!exchanged.ok) {
    return NextResponse.redirect(
      new URL(`/launch/error?reason=${encodeURIComponent(exchanged.error)}`, origin)
    );
  }

  const userinfo = await fetchUserInfo(exchanged.accessToken);
  if (!userinfo.ok) {
    return NextResponse.redirect(
      new URL(`/launch/error?reason=${encodeURIComponent(userinfo.error)}`, origin)
    );
  }

  const clientId = oauthConfig().clientId;
  const session = createLearnerSession({
    sub: userinfo.user.sub,
    email: userinfo.user.email,
    app_id: process.env.LUDWITT_APP_ID?.trim() || clientId || 'ludwitt-oauth',
  });

  const res = NextResponse.redirect(new URL('/?launched=1', origin));
  attachSessionCookie(res, session);
  res.cookies.set(OAUTH_STATE_COOKIE, '', { ...oauthCookieOptions(0), maxAge: 0 });

  try {
    await emitVentureEvent(
      'authenticated_session_started',
      { userId: session.sub, sessionId: session.sessionId },
      'ok',
      ludwittTransport
    );
  } catch {
    /* session valid even if Ludwitt metrics API unreachable */
  }

  return res;
}
