import { describe, expect, it } from 'vitest';
import { introDocId, runBroker, type BrokerDeps } from '@/lib/broker-job';
import type { HelperKnowledge, StuckSignal } from '@/lib/broker';

/**
 * The broker run loop — the half of the scheduled job that exists before the Admin SDK
 * credential does. What matters here:
 * - the doc id is derived, Firestore-safe, and stable under rewording, so re-runs and
 *   hostile titles both land on the same document instead of spamming fresh ones;
 * - the loop writes exactly what the matcher proposes, at those addresses, and nothing
 *   else — no side channel a cohort surface could ever read.
 */

const signal = (overrides: Partial<StuckSignal> = {}): StuckSignal => ({
  stuckUid: 'uid-stuck',
  problem: 'Fix the OAuth redirect loop',
  files: ['lib/auth.ts'],
  source: 'opt_in',
  ...overrides,
});

const helper = (overrides: Partial<HelperKnowledge> = {}): HelperKnowledge => ({
  uid: 'uid-helper',
  recipes: [{ id: 'r1', problem: 'Fix the OAuth redirect loop' }],
  shippedFiles: [],
  shippedTitles: [],
  brokerOptOut: false,
  activeIntros: 0,
  ...overrides,
});

function fakeDeps(signals: StuckSignal[], helpers: HelperKnowledge[]) {
  const writes: { id: string; stuckUid: string; helperUid: string }[] = [];
  const deps: BrokerDeps = {
    gather: async () => ({ signals, helpers }),
    upsert: async (id, draft) => {
      writes.push({ id, stuckUid: draft.stuckUid, helperUid: draft.helperUid });
    },
  };
  return { deps, writes };
}

describe('introDocId — the address that makes re-run spam unrepresentable', () => {
  it('is stable across runs and reworded-but-identical problems', () => {
    const a = introDocId({ stuckUid: 'a', helperUid: 'b', problem: 'Fix the OAuth loop' });
    const b = introDocId({ stuckUid: 'a', helperUid: 'b', problem: '  fix the OAUTH loop!! ' });
    expect(a).toBe(b);
  });

  it('is Firestore-safe even when the problem came from a branch title with slashes', () => {
    const id = introDocId({ stuckUid: 'a', helperUid: 'b', problem: 'fix/oauth/redirect-loop' });
    expect(id).not.toContain('/');
    expect(id).toMatch(/^i_a_b_[0-9a-f]{8}$/);
  });

  it('distinct struggles get distinct addresses', () => {
    const base = { stuckUid: 'a', helperUid: 'b' };
    expect(introDocId({ ...base, problem: 'Fix the OAuth loop' })).not.toBe(
      introDocId({ ...base, problem: 'Untangle the sync race' })
    );
    expect(introDocId({ stuckUid: 'a', helperUid: 'c', problem: 'Fix the OAuth loop' })).not.toBe(
      introDocId({ stuckUid: 'a', helperUid: 'b', problem: 'Fix the OAuth loop' })
    );
  });
});

describe('runBroker — gather, match, upsert at the derived address', () => {
  it('writes each proposed intro once, at its derived id', async () => {
    const { deps, writes } = fakeDeps([signal()], [helper()]);
    const result = await runBroker(deps);

    expect(result).toEqual({ proposed: 1, written: 1 });
    expect(writes).toEqual([
      {
        id: introDocId({ stuckUid: 'uid-stuck', helperUid: 'uid-helper', problem: 'Fix the OAuth redirect loop' }),
        stuckUid: 'uid-stuck',
        helperUid: 'uid-helper',
      },
    ]);
  });

  it('a second run proposes the same addresses — the store\'s create-if-absent makes it a no-op', async () => {
    const first = fakeDeps([signal()], [helper()]);
    await runBroker(first.deps);
    const second = fakeDeps([signal()], [helper()]);
    await runBroker(second.deps);
    expect(second.writes.map((w) => w.id)).toEqual(first.writes.map((w) => w.id));
  });

  it('writes nothing when the matcher proposes nothing — no signal, no trace', async () => {
    const { deps, writes } = fakeDeps([], [helper()]);
    const result = await runBroker(deps);
    expect(result).toEqual({ proposed: 0, written: 0 });
    expect(writes).toEqual([]);
  });

  it('a failed upsert aborts loudly rather than swallowing — an idempotent re-run heals it', async () => {
    const deps: BrokerDeps = {
      gather: async () => ({
        signals: [signal(), signal({ stuckUid: 'uid-stuck-2', problem: 'Another struggle' })],
        helpers: [helper({ recipes: [{ id: 'r1', problem: 'Fix the OAuth redirect loop' }, { id: 'r2', problem: 'Another struggle' }] })],
      }),
      upsert: async () => {
        throw new Error('firestore unavailable');
      },
    };
    await expect(runBroker(deps)).rejects.toThrow('firestore unavailable');
  });
});
