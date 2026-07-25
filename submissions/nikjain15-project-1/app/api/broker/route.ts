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
const onEmulator = () => !!process.env.FIRESTORE_EMULATOR_HOST;

/** Run one tick once the caller is authorised. Shared by the external-scheduler POST and
 * the Vercel-cron GET, so both take the exact same degrade-loudly path. */
function runTick() {
  const db = adminDb();
  if (!db) {
    // The credential is Nik's one action; until it exists this endpoint says so plainly.
    return NextResponse.json({ ok: false, reason: 'no_credential' }, { status: 503 });
  }
  return runBrokerJob(db).then(
    (result) => NextResponse.json({ ok: true, ...result }),
    (err) => {
      console.error('broker: run failed', err);
      // Half-written state is safe — every write is create-if-absent at a derived id, so
      // the next tick converges. Report the failure; never swallow it.
      return NextResponse.json({ ok: false, reason: 'run_failed' }, { status: 500 });
    }
  );
}

/**
 * GET — the cron door. Vercel Cron can only issue GET, and (when `CRON_SECRET` is set) sends
 * `Authorization: Bearer <CRON_SECRET>`. To switch Broker on: add a cron in the Vercel
 * dashboard (Project → Settings → Cron Jobs) pointing at `/api/broker` at a frequency the
 * plan allows, and set `CRON_SECRET` + `FIREBASE_SERVICE_ACCOUNT`. (The schedule lives in the
 * dashboard, not `vercel.json`, so the deploy can't be rejected by a plan's cron-frequency
 * limit.) Until then it 503s loudly rather than run open in prod — a cron ticking against an
 * unconfigured endpoint is harmless and self-heals the moment the credentials land.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  } else if (!onEmulator()) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }
  return runTick();
}

/** POST — the same job for any external scheduler that can send a header. Kept alongside
 * the cron GET so a non-Vercel scheduler (or a manual curl with the secret) still works. */
export async function POST(request: Request) {
  const secret = process.env.BROKER_SECRET;
  if (secret) {
    if (request.headers.get('x-broker-secret') !== secret) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
  } else if (!onEmulator()) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 });
  }
  return runTick();
}
