import { NextResponse } from 'next/server';
import { adminDb, runBrokerJob } from '@/lib/broker-admin';

/**
 * POST /api/broker — one tick of the broker job. LAYER-2-3-DESIGN.md, Layer 3.
 *
 * Hit on a schedule (Vercel cron, or anything that can POST with the secret). The work
 * itself lives in lib/broker-admin + lib/broker-job; this route is the front door and
 * the honest status report.
 *
 * **Why a shared secret.** The job writes `introductions` — docs that name someone as
 * struggling — with the Admin SDK, so an open endpoint would let anyone on the internet
 * trigger writes the rules exist to forbid. `BROKER_SECRET` is a server env var; the
 * cron sends it in `x-broker-secret`. On the emulator (no secret configured, emulator
 * host present) it runs open, because the emulator is a laptop-local test database.
 *
 * **Degrade loudly.** No Admin credential → 503 with a reason, never a silent success.
 * A scheduler that thinks it's brokering while writing nothing is the stale-as-live
 * failure wearing a cron hat.
 */
export async function POST(request: Request) {
  const secret = process.env.BROKER_SECRET;
  const onEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

  if (secret) {
    if (request.headers.get('x-broker-secret') !== secret) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  } else if (!onEmulator) {
    // No secret and not the emulator: refuse to run open in prod.
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }

  const db = adminDb();
  if (!db) {
    // The credential is Nik's one action; until it exists this endpoint says so plainly.
    return NextResponse.json({ ok: false, reason: 'no_credential' }, { status: 503 });
  }

  try {
    const result = await runBrokerJob(db);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('broker: run failed', err);
    // Half-written state is safe — every write is create-if-absent at a derived id, so
    // the next tick converges. Report the failure; never swallow it.
    return NextResponse.json({ ok: false, reason: 'run_failed' }, { status: 500 });
  }
}
