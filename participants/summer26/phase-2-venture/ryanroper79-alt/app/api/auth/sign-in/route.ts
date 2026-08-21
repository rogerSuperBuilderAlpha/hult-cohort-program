import { NextResponse } from 'next/server';
import {
  attachSessionCookie,
  createLearnerSession,
  ludwittTransport,
} from '@/lib/ludwitt/session';
import { emitVentureEvent } from '@/lib/ludwitt/events';
import { parseProfileSignIn, profileToUserId } from '@/lib/auth/profile-sign-in';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let profile;
  try {
    profile = parseProfileSignIn({
      name: body.name as string | undefined,
      companyName: body.companyName as string | undefined,
      email: body.email as string | undefined,
      username: body.username as string | undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid sign-in details' },
      { status: 400 }
    );
  }

  const appId = process.env.LUDWITT_APP_ID?.trim() || 'ceal-green-energy-auditor';
  const session = createLearnerSession({
    sub: profileToUserId(profile.username),
    email: profile.email,
    app_id: appId,
    name: profile.name,
    companyName: profile.companyName ?? undefined,
    username: profile.username,
  });

  const res = NextResponse.json({
    ok: true,
    profile: {
      name: profile.name,
      companyName: profile.companyName,
      email: profile.email,
      username: profile.username,
    },
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
    /* Ludwitt optional — session still valid */
  }

  return res;
}
