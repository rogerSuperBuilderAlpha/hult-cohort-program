import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GET, POST } from '@/app/api/broker/route';

/**
 * The broker route's auth gate — the Vercel-cron GET and the external-scheduler POST.
 * No emulator, no credential here, so a call that PASSES auth lands on the honest
 * `no_credential` 503; a call that FAILS auth is rejected before it ever reaches the job.
 */

const saved = { ...process.env };
beforeEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.BROKER_SECRET;
  delete process.env.FIRESTORE_EMULATOR_HOST;
  delete process.env.FIREBASE_SERVICE_ACCOUNT;
});
afterEach(() => {
  process.env = { ...saved };
});

const get = (headers: Record<string, string> = {}) =>
  GET(new Request('https://x/api/broker', { headers }));
const post = (headers: Record<string, string> = {}) =>
  POST(new Request('https://x/api/broker', { method: 'POST', headers }));

describe('GET — the Vercel cron door', () => {
  it('503 not_configured when no CRON_SECRET is set (refuses to run open in prod)', async () => {
    const res = await get();
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ reason: 'not_configured' });
  });

  it('403 when CRON_SECRET is set but the Authorization header is wrong', async () => {
    process.env.CRON_SECRET = 's3cret';
    expect((await get({ authorization: 'Bearer nope' })).status).toBe(403);
  });

  it('passes auth with the right bearer, then 503 no_credential (no service account yet)', async () => {
    process.env.CRON_SECRET = 's3cret';
    const res = await get({ authorization: 'Bearer s3cret' });
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ reason: 'no_credential' });
  });
});

describe('POST — the external-scheduler door', () => {
  it('403 when BROKER_SECRET is set but x-broker-secret is wrong', async () => {
    process.env.BROKER_SECRET = 'abc';
    expect((await post({ 'x-broker-secret': 'wrong' })).status).toBe(403);
  });

  it('passes with the right secret, then 503 no_credential', async () => {
    process.env.BROKER_SECRET = 'abc';
    const res = await post({ 'x-broker-secret': 'abc' });
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ reason: 'no_credential' });
  });
});
