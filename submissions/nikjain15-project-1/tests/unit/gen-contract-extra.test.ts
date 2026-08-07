import { describe, expect, it } from 'vitest';
import {
  BUS,
  canTransition,
  contextKey,
  isValidHandle,
  newAgentTask,
  type AgentTaskStatus,
} from '@/lib/shared-context-contract';

/**
 * ADDITIONAL contract edge cases — complements contract-golden.test.ts without duplicating it.
 * Focus: unicode/whitespace/length/case in contextKey, isValidHandle boundaries, rich-payload
 * preservation + handle normalization in newAgentTask, the exhaustive 16-pair transition matrix,
 * and BUS path builders for handles that need normalization.
 *
 * Pure unit tests — no Firestore, no SDK, no network.
 */

describe('contextKey — whitespace and case normalization edge cases', () => {
  it('trims leading and trailing whitespace but preserves interior spaces', () => {
    // .trim() only strips the ends; interior whitespace is left intact (and lowercased).
    expect(contextKey('  Nik Jain  ')).toBe('nik jain');
  });

  it('strips a full mix of leading/trailing whitespace kinds (tab, newline, CR)', () => {
    expect(contextKey('\t\n\r  Roger \r\n\t')).toBe('roger');
  });

  it('does NOT strip a non-breaking space in the interior', () => {
    //   is not ASCII whitespace but String.trim() DOES remove it at the ends...
    // interior NBSP must survive.
    expect(contextKey('a b')).toBe('a b');
  });

  it('String.trim removes a leading/trailing non-breaking space (Unicode whitespace)', () => {
    // Guards the exact semantics of trim(): NBSP counts as trimmable whitespace.
    expect(contextKey(' roger ')).toBe('roger');
  });

  it('collapses a whitespace-only string of assorted blanks to empty', () => {
    expect(contextKey('\t \n \r \f \v ')).toBe('');
  });

  it('lowercases mixed-case ASCII fully', () => {
    expect(contextKey('NiKjAiN15')).toBe('nikjain15');
  });

  it('lowercases accented unicode using default (locale-independent) case mapping', () => {
    expect(contextKey('ÀÉÎ')).toBe('àéî');
  });

  it('lowercases German ß-adjacent and Greek capitals via toLowerCase default rules', () => {
    expect(contextKey('ΣΤΉ')).toBe('στή');
  });

  it('the Turkish dotted-capital-I lowercases the JS-default way (not locale-aware)', () => {
    // toLowerCase() (no locale) maps 'I' -> 'i', never to dotless 'ı'. Locks that both apps agree.
    expect(contextKey('IST')).toBe('ist');
  });

  it('preserves digits, hyphens and underscores that are legal in GitHub logins', () => {
    expect(contextKey('Nik-Jain_15')).toBe('nik-jain_15');
  });

  it('handles a very long handle (10k chars) without truncation and lowercases all of it', () => {
    const long = 'A'.repeat(10_000);
    const key = contextKey('  ' + long + '  ');
    expect(key).toHaveLength(10_000);
    expect(key).toBe('a'.repeat(10_000));
  });

  it('keeps emoji and astral-plane codepoints intact (they have no lowercase form)', () => {
    expect(contextKey('  Nik😀🚀  ')).toBe('nik😀🚀');
  });

  it('treats an already-normalized handle as a fixed point (idempotent)', () => {
    const once = contextKey('  NikJain15 ');
    expect(contextKey(once)).toBe(once);
  });

  it('a zero-width space is NOT trimmed and NOT altered', () => {
    // ​ is not whitespace to trim(); it must remain (interior or edge).
    expect(contextKey('​roger')).toBe('​roger');
  });
});

describe('isValidHandle — boundaries', () => {
  it('a single non-space character is valid', () => {
    expect(isValidHandle('a')).toBe(true);
  });

  it('a single space is invalid (normalizes to empty)', () => {
    expect(isValidHandle(' ')).toBe(false);
  });

  it('surrounding whitespace around one real char is still valid', () => {
    expect(isValidHandle('\t x \n')).toBe(true);
  });

  it('a non-breaking-space-only string is invalid (trim removes it)', () => {
    expect(isValidHandle('  ')).toBe(false);
  });

  it('a zero-width-space-only string is VALID (trim does not remove it)', () => {
    // Consequence of contextKey using trim(): ZWSP is not stripped, so length > 0.
    expect(isValidHandle('​')).toBe(true);
  });

  it('a purely-emoji handle is valid', () => {
    expect(isValidHandle('🚀')).toBe(true);
  });

  it('null and undefined are invalid', () => {
    expect(isValidHandle(null)).toBe(false);
    expect(isValidHandle(undefined)).toBe(false);
  });

  it('validity is consistent with contextKey length for assorted inputs', () => {
    for (const h of ['  ', 'x', ' ', '​', 'ABC', '', null, undefined]) {
      expect(isValidHandle(h)).toBe(contextKey(h).length > 0);
    }
  });
});

describe('BUS path builders — handles needing normalization', () => {
  it('builds context/memory/activity from a messy mixed-case, padded handle', () => {
    expect(BUS.context('  RoGeR  ')).toBe('cohortContext/roger');
    expect(BUS.memory('  RoGeR  ')).toBe('cohortContext/roger/memory');
    expect(BUS.activity('  RoGeR  ')).toBe('cohortContext/roger/activity');
  });

  it('interior spaces in a handle survive into the path (no path-segment injection guard here)', () => {
    // Documents current behavior: contextKey does not remove interior spaces, so the path
    // carries them verbatim. Both apps must agree on exactly this.
    expect(BUS.context('nik jain')).toBe('cohortContext/nik jain');
  });

  it('a handle that already contains a slash produces extra path segments (no sanitization)', () => {
    // Noting current behavior — contextKey does not strip '/', so it leaks into the path.
    expect(BUS.memory('a/b')).toBe('cohortContext/a/b/memory');
  });

  it('an emoji handle is embedded unchanged in the built path', () => {
    expect(BUS.activity('🚀Nik')).toBe('cohortContext/🚀nik/activity');
  });

  it('collection roots are plain constants, not functions', () => {
    expect(typeof BUS.contexts).toBe('string');
    expect(typeof BUS.tasks).toBe('string');
    expect(typeof BUS.context).toBe('function');
  });

  it('memory/activity paths are exactly the context path plus a suffix', () => {
    const h = '  MixedCase ';
    expect(BUS.memory(h)).toBe(`${BUS.context(h)}/memory`);
    expect(BUS.activity(h)).toBe(`${BUS.context(h)}/activity`);
  });
});

describe('newAgentTask — rich payload preservation & handle normalization', () => {
  it('normalizes a messy handle while preserving a deeply nested payload by reference-equal contents', () => {
    const payload = {
      shas: ['abc123', 'def456'],
      meta: { branch: 'fix/oauth', nested: { deep: [1, 2, { k: 'v' }] } },
      count: 3,
      flag: false,
      note: null as unknown,
    };
    const t = newAgentTask(
      { fromApp: 'rally', toApp: 'pulse', handle: '  NikJain15 ', intent: 'summarize_week', payload },
      42,
    );
    expect(t.handle).toBe('nikjain15');
    expect(t.payload).toEqual(payload);
    // Same object is threaded through (no defensive copy) — pins current behavior.
    expect(t.payload).toBe(payload);
  });

  it('preserves an empty-object payload distinctly from the default', () => {
    const payload = {};
    const t = newAgentTask(
      { fromApp: 'a', toApp: 'b', handle: 'x', intent: 'i', payload },
      1,
    );
    expect(t.payload).toBe(payload);
  });

  it('falls back to a fresh {} when payload is undefined', () => {
    const t = newAgentTask({ fromApp: 'a', toApp: 'b', handle: 'x', intent: 'i' }, 1);
    expect(t.payload).toEqual({});
  });

  it('sets createdAt and updatedAt both to nowMs, including 0 and negative clocks', () => {
    const z = newAgentTask({ fromApp: 'a', toApp: 'b', handle: 'x', intent: 'i' }, 0);
    expect(z.createdAt).toBe(0);
    expect(z.updatedAt).toBe(0);
    const neg = newAgentTask({ fromApp: 'a', toApp: 'b', handle: 'x', intent: 'i' }, -5);
    expect(neg.createdAt).toBe(-5);
    expect(neg.updatedAt).toBe(-5);
  });

  it('always starts pending with a null result and no id, regardless of input', () => {
    const t = newAgentTask(
      { fromApp: 'pulse', toApp: 'rally', handle: 'ROGER', intent: 'x', payload: { a: 1 } },
      7,
    );
    expect(t.status).toBe('pending');
    expect(t.result).toBeNull();
    expect(t.id).toBeUndefined();
  });

  it('does not lowercase fromApp/toApp/intent — only the handle is normalized', () => {
    const t = newAgentTask(
      { fromApp: 'Rally', toApp: 'Pulse', handle: 'ROGER', intent: 'Summarize_Week' },
      1,
    );
    expect(t.fromApp).toBe('Rally');
    expect(t.toApp).toBe('Pulse');
    expect(t.intent).toBe('Summarize_Week');
    expect(t.handle).toBe('roger');
  });

  it('an all-whitespace handle normalizes to an empty string (task is still constructed)', () => {
    const t = newAgentTask({ fromApp: 'a', toApp: 'b', handle: '   ', intent: 'i' }, 1);
    expect(t.handle).toBe('');
    // isValidHandle would flag this — the constructor itself does not reject it.
    expect(isValidHandle(t.handle)).toBe(false);
  });
});

describe('canTransition — exhaustive 16-pair matrix (4×4)', () => {
  const S: AgentTaskStatus[] = ['pending', 'claimed', 'done', 'failed'];
  // Expected truth table for every ordered (from,to) pair.
  const expected: Record<AgentTaskStatus, Record<AgentTaskStatus, boolean>> = {
    pending: { pending: false, claimed: true, done: false, failed: true },
    claimed: { pending: false, claimed: false, done: true, failed: true },
    done: { pending: false, claimed: false, done: false, failed: false },
    failed: { pending: false, claimed: false, done: false, failed: false },
  };

  for (const from of S) {
    for (const to of S) {
      it(`${from} → ${to} is ${expected[from][to]}`, () => {
        expect(canTransition(from, to)).toBe(expected[from][to]);
      });
    }
  }

  it('no status can transition to itself (no self-loops)', () => {
    for (const s of S) expect(canTransition(s, s)).toBe(false);
  });

  it('terminal states (done, failed) allow no outgoing transitions at all', () => {
    for (const to of S) {
      expect(canTransition('done', to)).toBe(false);
      expect(canTransition('failed', to)).toBe(false);
    }
  });

  it('every state can reach failed except the terminals themselves', () => {
    expect(canTransition('pending', 'failed')).toBe(true);
    expect(canTransition('claimed', 'failed')).toBe(true);
    expect(canTransition('done', 'failed')).toBe(false);
    expect(canTransition('failed', 'failed')).toBe(false);
  });

  it('returns false for an unknown/garbage from-status (defensive ?? false)', () => {
    expect(canTransition('bogus' as AgentTaskStatus, 'done')).toBe(false);
  });

  it('returns false for an unknown to-status from a real from-status', () => {
    expect(canTransition('pending', 'bogus' as AgentTaskStatus)).toBe(false);
  });

  it('exactly 4 of the 16 ordered pairs are legal', () => {
    let legal = 0;
    for (const from of S) for (const to of S) if (canTransition(from, to)) legal++;
    expect(legal).toBe(4);
  });
});
