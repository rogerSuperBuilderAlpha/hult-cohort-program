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
 * CONTRACT DRIFT GUARD (cross-app regression #1) — Rally's half.
 *
 * These golden values are IDENTICAL to Pulse's tests/unit/contract-golden.test.ts. The bus works
 * only if both apps agree on paths, handle normalization, and the task lifecycle; a single
 * divergent value silently breaks sharing. This test pins the contract's BEHAVIOR (formatting-
 * immune, unlike a source diff). If Rally's contract (@cohort/core/shared-context) drifts, this
 * fails; if Pulse's drifts, its copy fails. `scripts/audit/contract-drift.mjs` (in Pulse) runs
 * both in one command. Change the contract on purpose → update these values in BOTH apps together.
 */

describe('contract drift — bus paths are keyed by the normalized handle', () => {
  it('collection roots are exactly these strings', () => {
    expect(BUS.contexts).toBe('cohortContext');
    expect(BUS.tasks).toBe('agentTasks');
  });

  it('per-handle paths normalize the handle and use the exact sub-collection names', () => {
    expect(BUS.context('NikJain15')).toBe('cohortContext/nikjain15');
    expect(BUS.memory('NikJain15')).toBe('cohortContext/nikjain15/memory');
    expect(BUS.activity('NikJain15')).toBe('cohortContext/nikjain15/activity');
    expect(BUS.context('  ROger ')).toBe('cohortContext/roger');
  });
});

describe('contract drift — handle normalization', () => {
  it('contextKey lowercases and trims; empty/null collapse to ""', () => {
    expect(contextKey('  NikJain15 ')).toBe('nikjain15');
    expect(contextKey('ALLCAPS')).toBe('allcaps');
    expect(contextKey(null)).toBe('');
    expect(contextKey(undefined)).toBe('');
    expect(contextKey('   ')).toBe('');
  });

  it('isValidHandle is true only for a non-empty normalized handle', () => {
    expect(isValidHandle('nikjain15')).toBe(true);
    expect(isValidHandle('  x ')).toBe(true);
    expect(isValidHandle('')).toBe(false);
    expect(isValidHandle('   ')).toBe(false);
    expect(isValidHandle(null)).toBe(false);
  });
});

describe('contract drift — agent-task lifecycle', () => {
  const S: AgentTaskStatus[] = ['pending', 'claimed', 'done', 'failed'];

  it('the full transition matrix is exactly pending→{claimed,failed}, claimed→{done,failed}, terminals→{}', () => {
    const matrix: Record<string, string[]> = {};
    for (const from of S) matrix[from] = S.filter((to) => canTransition(from, to));
    expect(matrix).toEqual({
      pending: ['claimed', 'failed'],
      claimed: ['done', 'failed'],
      done: [],
      failed: [],
    });
  });

  it('newAgentTask produces the exact shape, handle-normalized, pending, with defaults', () => {
    const t = newAgentTask(
      { fromApp: 'rally', toApp: 'pulse', handle: 'NikJain15', intent: 'summarize_week' },
      1000
    );
    expect(t).toEqual({
      fromApp: 'rally',
      toApp: 'pulse',
      handle: 'nikjain15',
      intent: 'summarize_week',
      payload: {},
      status: 'pending',
      result: null,
      createdAt: 1000,
      updatedAt: 1000,
    });
  });

  it('newAgentTask keeps a provided payload', () => {
    const t = newAgentTask(
      { fromApp: 'pulse', toApp: 'rally', handle: 'x', intent: 'i', payload: { a: 1 } },
      5
    );
    expect(t.payload).toEqual({ a: 1 });
  });
});
