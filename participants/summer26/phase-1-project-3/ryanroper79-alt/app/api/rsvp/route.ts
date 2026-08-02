import { NextResponse } from 'next/server';
import { submitShowcaseRsvp, validateShowcaseRsvp } from '@/lib/rsvp-server';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const limit = checkRateLimit(`rsvp:${clientIp(request)}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  if (String(body._honeypot ?? '').trim()) {
    return NextResponse.json({ ok: true });
  }

  try {
    const input = validateShowcaseRsvp(body);
    const result = await submitShowcaseRsvp(input);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'RSVP failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
