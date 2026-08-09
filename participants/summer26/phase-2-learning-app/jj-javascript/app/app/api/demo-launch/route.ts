import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { ludwittConfig } from '@/lib/ludwitt/session';

const VISITOR_COOKIE = 'git_arcade_visitor';

export async function POST(request: Request) {
  try {
    const { appId, devKey, baseUrl } = ludwittConfig();
    const jar = await cookies();
    let userId = jar.get(VISITOR_COOKIE)?.value?.trim();
    if (!userId) userId = `external-${randomUUID()}`;
    const email = `player.${userId.slice(-8)}@example.com`;

    const tokenRes = await fetch(`${baseUrl}/auth/launch-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${devKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ app_id: appId, user_id: userId, email }),
    });
    const body = (await tokenRes.json()) as { launch_url?: string; error?: string };
    if (!tokenRes.ok || !body.launch_url) {
      return NextResponse.json({ error: body.error || 'launch token failed' }, { status: 502 });
    }

    const response = NextResponse.redirect(new URL(body.launch_url, request.url), 303);
    if (!jar.get(VISITOR_COOKIE)) {
      response.cookies.set(VISITOR_COOKIE, userId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'demo launch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
