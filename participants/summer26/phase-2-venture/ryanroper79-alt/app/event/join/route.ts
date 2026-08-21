import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import {
  sessionCookieOptions,
} from '@/lib/ludwitt/session';
import {
  getEventEndsAt,
  isEventWindowOpen,
  verifyEventAccessCode,
  eventSessionMaxAgeSec,
} from '@/lib/event/access';

const EVENT_ACCESS_COOKIE = 'event_access_granted';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!isEventWindowOpen()) {
    const endsAt = getEventEndsAt();
    const msg = endsAt
      ? `This session link expired at ${endsAt.toLocaleString()}.`
      : 'This session link is not active.';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(msg)}`, url.origin)
    );
  }

  if (!verifyEventAccessCode(code)) {
    return NextResponse.redirect(
      new URL('/?error=Invalid+session+code&signin=1', url.origin)
    );
  }

  const response = NextResponse.redirect(new URL('/?event=1&signin=1', url.origin));
  response.cookies.set(
    EVENT_ACCESS_COOKIE,
    randomUUID(),
    sessionCookieOptions(eventSessionMaxAgeSec())
  );
  return response;
}
