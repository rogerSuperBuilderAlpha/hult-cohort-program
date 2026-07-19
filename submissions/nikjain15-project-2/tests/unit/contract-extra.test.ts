import { describe, expect, it } from 'vitest';
import {
  BUS,
  canTransition,
  contextKey,
  isValidHandle,
  newAgentTask,
  type AgentTaskStatus,
} from '@cohort/core/shared-context';

/**
 * CONTRACT DRIFT GUARD (cross-app regression #1) — Rally's half, extra coverage.
 *
 * Companion to contract-golden.test.ts. Pins more edges of the shared bus contract so any drift
 * between Rally and Pulse fails loudly. Values MUST match @cohort/core/shared-context exactly;
 * change the contract on purpose → update BOTH apps together.
 */

describe('contract-extra — contextKey normalization', () => {
  it('lowercases uppercase handles', () => {
    expect(contextKey('NikJain15')).toBe('nikjain15');
    expect(contextKey('ROGER')).toBe('roger');
  });

  it('trims surrounding whitespace including tabs/newlines', () => {
    expect(contextKey('  spaced  ')).toBe('spaced');
    expect(contextKey('\tTabbed\n')).toBe('tabbed');
    expect(contextKey('  MixedCase  ')).toBe('mixedcase');
  });

  it('collapses null/undefined/blank to empty string', () => {
    expect(contextKey(null)).toBe('');
    expect(contextKey(undefined)).toBe('');
    expect(contextKey('')).toBe('');
    expect(contextKey('   ')).toBe('');
    expect(contextKey('\t\n ')).toBe('');
  });

  it('does not strip internal characters, only outer whitespace', () => {
    expect(contextKey('  nik-jain_15 ')).toBe('nik-jain_15');
  });
});

describe('contract-extra — isValidHandle edges', () => {
  it('true for any non-empty normalized handle', () => {
    expect(isValidHandle('a')).toBe(true);
    expect(isValidHandle('  x ')).toBe(true);
    expect(isValidHandle('NikJain15')).toBe(true);
  });

  it('false for empty, whitespace-only, null, undefined', () => {
    expect(isValidHandle('')).toBe(false);
    expect(isValidHandle('   ')).toBe(false);
    expect(isValidHandle('\t\n')).toBe(false);
    expect(isValidHandle(null)).toBe(false);
    expect(isValidHandle(undefined)).toBe(false);
  });
});

describe('contract-extra — BUS path strings for several handles', () => {
  it('collection roots are stable constants', () => {
    expect(BUS.contexts).toBe('cohortContext');
    expect(BUS.tasks).toBe('agentTasks');
  });

  it('context/memory/activity paths for a plain handle', () => {
    expect(BUS.context('roger')).toBe('cohortContext/roger');
    expect(BUS.memory('roger')).toBe('cohortContext/roger/memory');
    expect(BUS.activity('roger')).toBe('cohortContext/roger/activity');
  });

  it('normalizes case+whitespace inside every path builder', () => {
    expect(BUS.context('  NikJain15 ')).toBe('cohortContext/nikjain15');
    expect(BUS.memory('  NikJain15 ')).toBe('cohortContext/nikjain15/memory');
    expect(BUS.activity('  NikJain15 ')).toBe('cohortContext/nikjain15/activity');
  });

  it('distinct handles map to distinct paths', () => {
    expect(BUS.context('alice')).toBe('cohortContext/alice');
    expect(BUS.memory('BOB')).toBe('cohortContext/bob/memory');
    expect(BUS.activity('Carol')).toBe('cohortContext/carol/activity');
  });
});

describe('contract-extra — canTransition full matrix', () => {
  it('pending → claimed and pending → failed are legal', () => {
    expect(canTransition('pending', 'claimed')).toBe(true);
    expect(canTransition('pending', 'failed')).toBe(true);
  });

  it('claimed → done and claimed → failed are legal', () => {
    expect(canTransition('claimed', 'done')).toBe(true);
    expect(canTransition('claimed', 'failed')).toBe(true);
  });

  it('pending → done and pending → pending are illegal', () => {
    expect(canTransition('pending', 'done')).toBe(false);
    expect(canTransition('pending', 'pending')).toBe(false);
  });

  it('claimed → pending and claimed → claimed are illegal', () => {
    expect(canTransition('claimed', 'pending')).toBe(false);
    expect(canTransition('claimed', 'claimed')).toBe(false);
  });

  it('done is terminal — no outgoing transition', () => {
    expect(canTransition('done', 'pending')).toBe(false);
    expect(canTransition('done', 'claimed')).toBe(false);
    expect(canTransition('done', 'done')).toBe(false);
    expect(canTransition('done', 'failed')).toBe(false);
  });

  it('failed is terminal — no outgoing transition', () => {
    expect(canTransition('failed', 'pending')).toBe(false);
    expect(canTransition('failed', 'claimed')).toBe(false);
    expect(canTransition('failed', 'done')).toBe(false);
    expect(canTransition('failed', 'failed')).toBe(false);
  });

  it('the exhaustive matrix matches the contract exactly', () => {
    const S: AgentTaskStatus[] = ['pending', 'claimed', 'done', 'failed'];
    const matrix: Record<string, string[]> = {};
    for (const from of S) matrix[from] = S.filter((to) => canTransition(from, to));
    expect(matrix).toEqual({
      pending: ['claimed', 'failed'],
      claimed: ['done', 'failed'],
      done: [],
      failed: [],
    });
  });
});

describe('contract-extra — newAgentTask output shape', () => {
  it('produces the exact pending shape with normalized handle and defaults', () => {
    const t = newAgentTask(
      { fromApp: 'rally', toApp: 'pulse', handle: '  NikJain15 ', intent: 'summarize_week' },
      2500
    );
    expect(t).toEqual({
      fromApp: 'rally',
      toApp: 'pulse',
      handle: 'nikjain15',
      intent: 'summarize_week',
      payload: {},
      status: 'pending',
      result: null,
      createdAt: 2500,
      updatedAt: 2500,
    });
  });

  it('defaults payload to {} and result to null, status pending', () => {
    const t = newAgentTask(
      { fromApp: 'pulse', toApp: 'rally', handle: 'x', intent: 'i' },
      1
    );
    expect(t.payload).toEqual({});
    expect(t.result).toBeNull();
    expect(t.status).toBe('pending');
  });

  it('keeps a provided payload verbatim', () => {
    const t = newAgentTask(
      { fromApp: 'a', toApp: 'b', handle: 'h', intent: 'i', payload: { week: 3, nested: { ok: true } } },
      7
    );
    expect(t.payload).toEqual({ week: 3, nested: { ok: true } });
  });

  it('sets createdAt and updatedAt to the same provided nowMs', () => {
    const t = newAgentTask({ fromApp: 'a', toApp: 'b', handle: 'h', intent: 'i' }, 99999);
    expect(t.createdAt).toBe(99999);
    expect(t.updatedAt).toBe(99999);
  });

  it('does not set an id (caller persists and assigns it)', () => {
    const t = newAgentTask({ fromApp: 'a', toApp: 'b', handle: 'h', intent: 'i' }, 0);
    expect(t.id).toBeUndefined();
  });

  it('normalizes handle even without whitespace, and preserves fromApp/toApp/intent', () => {
    const t = newAgentTask(
      { fromApp: 'Rally', toApp: 'Pulse', handle: 'ALLCAPS', intent: 'do_thing' },
      42
    );
    expect(t.handle).toBe('allcaps');
    expect(t.fromApp).toBe('Rally');
    expect(t.toApp).toBe('Pulse');
    expect(t.intent).toBe('do_thing');
  });
});
