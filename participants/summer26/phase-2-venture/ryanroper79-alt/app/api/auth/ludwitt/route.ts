import { NextResponse } from 'next/server';
import {
  buildAuthorizeUrl,
  createOAuthState,
  isOAuthConfigured,
  OAUTH_STATE_COOKIE,
  oauthCookieOptions,
} from '@/lib/ludwitt/oauth';
import { siteOrigin } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isOAuthConfigured()) {
    return NextResponse.redirect(new URL('/login?error=oauth_not_configured', request.url));
  }

  const origin = siteOrigin() || new URL(request.url).origin;
  const redirectUri = `${origin}/auth/callback`;
  const state = createOAuthState();
  const authorize = buildAuthorizeUrl({ redirectUri, state });

  const res = NextResponse.redirect(authorize);
  res.cookies.set(OAUTH_STATE_COOKIE, state, oauthCookieOptions(600));
  return res;
}
