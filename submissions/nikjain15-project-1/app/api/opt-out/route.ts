import { NextResponse } from 'next/server';
import { normaliseHandle, tombstoneHandle } from '@/lib/opt-out';

/**
 * POST /api/opt-out — tombstone a handle. DESIGN-SPEC §5.0.
 *
 * **No auth, by design.** "Someone who wants out shouldn't have to create an account to
 * leave." A signup wall in front of the exit is worse than no exit at all, because it
 * looks like one.
 *
 * The write lives here rather than in the client component so the handle is normalised
 * and validated in exactly one place, on a surface the browser can't skip.
 */

// A tombstone must take effect now, not at the next ISR window.
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'malformed' }, { status: 400 });
  }

  const input = (raw as { handle?: unknown } | null)?.handle;
  const handle = typeof input === 'string' ? normaliseHandle(input) : null;

  if (!handle) {
    return NextResponse.json({ error: 'invalid_handle' }, { status: 400 });
  }

  try {
    await tombstoneHandle(handle);
  } catch (err) {
    // Never leak a raw Firebase code to the page — the caller renders plain language.
    // Log it server-side, though: a removal that silently fails is the worst bug this
    // route can have, and a swallowed error makes it invisible to us as well as to them.
    console.error('opt-out: tombstone failed', {
      useEmulator: process.env.NEXT_PUBLIC_USE_EMULATOR ?? null,
      err,
    });
    return NextResponse.json({ error: 'write_failed' }, { status: 503 });
  }

  return NextResponse.json({ handle });
}
