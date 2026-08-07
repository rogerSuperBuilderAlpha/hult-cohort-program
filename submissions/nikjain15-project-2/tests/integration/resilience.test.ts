/**
 * Resilience suite for the credential/degrade seams in lib/admin.ts.
 *
 * The whole app's "core comms works with the smart layer off" promise leans on these two
 * accessors degrading rather than crashing: adminDb() must be usable under the emulator with no
 * production key, and busDb() must transparently fall back to the primary db whenever the shared
 * cross-app key is absent OR malformed — never throw. These tests exercise those seams directly,
 * saving/restoring process.env around each case so no cross-test env leakage occurs.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adminDb, busDb } from '@/lib/admin';
import { clearFirestore } from './helpers';

const HANDLE = 'zz-test-resilience';

// Snapshot the one env var these tests mutate; restore it after every case.
let savedShared: string | undefined;

beforeEach(async () => {
  savedShared = process.env.SHARED_FIREBASE_SERVICE_ACCOUNT;
  await clearFirestore();
});

afterEach(async () => {
  if (savedShared === undefined) delete process.env.SHARED_FIREBASE_SERVICE_ACCOUNT;
  else process.env.SHARED_FIREBASE_SERVICE_ACCOUNT = savedShared;
  await clearFirestore();
});

describe('adminDb() — the primary server path under the emulator', () => {
  it('returns a non-null Firestore (emulator needs no production credential)', () => {
    const db = adminDb();
    expect(db).not.toBeNull();
  });

  it('the returned Firestore is usable — a write round-trips', async () => {
    const db = adminDb();
    expect(db).not.toBeNull();
    await db!.collection('zz-test-probe').doc(HANDLE).set({ ok: true, n: 7 });
    const snap = await db!.collection('zz-test-probe').doc(HANDLE).get();
    expect(snap.exists).toBe(true);
    expect(snap.data()).toMatchObject({ ok: true, n: 7 });
  });
});

describe('busDb() — the shared cross-app bus with the degrade rule', () => {
  it('with SHARED_FIREBASE_SERVICE_ACCOUNT UNSET, returns the same primary db (falls back to adminDb)', async () => {
    delete process.env.SHARED_FIREBASE_SERVICE_ACCOUNT;
    const bus = busDb();
    expect(bus).not.toBeNull();

    // Prove it is the SAME database (not a separate 'bus' app): write via busDb, read via adminDb.
    await bus!.collection('zz-test-bus').doc(HANDLE).set({ via: 'bus', v: 1 });
    const admin = adminDb();
    const seen = await admin!.collection('zz-test-bus').doc(HANDLE).get();
    expect(seen.exists).toBe(true);
    expect(seen.data()).toMatchObject({ via: 'bus', v: 1 });
  });

  it('the reverse also holds — a write via adminDb is visible through busDb (one shared db)', async () => {
    delete process.env.SHARED_FIREBASE_SERVICE_ACCOUNT;
    const admin = adminDb();
    await admin!.collection('zz-test-bus').doc(HANDLE).set({ via: 'admin', v: 2 });
    const bus = busDb();
    const seen = await bus!.collection('zz-test-bus').doc(HANDLE).get();
    expect(seen.exists).toBe(true);
    expect(seen.data()).toMatchObject({ via: 'admin', v: 2 });
  });

  it('with a MALFORMED shared key ("not-json"), does NOT throw and still returns a usable db', async () => {
    process.env.SHARED_FIREBASE_SERVICE_ACCOUNT = 'not-json';
    let bus: ReturnType<typeof busDb> = null;
    // The whole point of the seam: a bad key must not take the assistant down.
    expect(() => {
      bus = busDb();
    }).not.toThrow();
    expect(bus).not.toBeNull();

    // Fallback path is the primary emulator db — so it must round-trip like adminDb.
    await bus!.collection('zz-test-bus').doc(HANDLE).set({ via: 'malformed-fallback', v: 3 });
    const admin = adminDb();
    const seen = await admin!.collection('zz-test-bus').doc(HANDLE).get();
    expect(seen.exists).toBe(true);
    expect(seen.data()).toMatchObject({ via: 'malformed-fallback', v: 3 });
  });

  it('a malformed shared key that is valid JSON but not a credential still degrades (no throw)', async () => {
    // cert() on a JSON object missing the required fields throws — caught the same way as bad JSON.
    process.env.SHARED_FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ not: 'a-service-account' });
    let bus: ReturnType<typeof busDb> = null;
    expect(() => {
      bus = busDb();
    }).not.toThrow();
    expect(bus).not.toBeNull();

    await bus!.collection('zz-test-bus').doc(HANDLE).set({ via: 'bad-shape-fallback', v: 4 });
    const seen = await adminDb()!.collection('zz-test-bus').doc(HANDLE).get();
    expect(seen.data()).toMatchObject({ via: 'bad-shape-fallback', v: 4 });
  });

  it('busDb() is stable across the unset → malformed → unset transitions (each returns a usable db)', async () => {
    delete process.env.SHARED_FIREBASE_SERVICE_ACCOUNT;
    expect(busDb()).not.toBeNull();

    process.env.SHARED_FIREBASE_SERVICE_ACCOUNT = 'still-not-json';
    expect(busDb()).not.toBeNull();

    delete process.env.SHARED_FIREBASE_SERVICE_ACCOUNT;
    const bus = busDb();
    expect(bus).not.toBeNull();
    await bus!.collection('zz-test-bus').doc(HANDLE).set({ via: 'stable', v: 5 });
    const seen = await adminDb()!.collection('zz-test-bus').doc(HANDLE).get();
    expect(seen.data()).toMatchObject({ via: 'stable', v: 5 });
  });
});
