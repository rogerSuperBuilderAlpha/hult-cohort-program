import { describe, expect, it } from 'vitest';
import { BUS, canTransition, contextKey, isValidHandle, newAgentTask } from '@cohort/core/shared-context';

describe('shared-context contract — the cross-app key is the GitHub handle', () => {
  it('normalizes the handle case-insensitively', () => {
    expect(contextKey('  NikJain15 ')).toBe('nikjain15');
    expect(contextKey(null)).toBe('');
    expect(isValidHandle('nikjain15')).toBe(true);
    expect(isValidHandle('')).toBe(false);
  });

  it('paths are keyed by the normalized handle so every app agrees', () => {
    expect(BUS.context('NikJain15')).toBe('cohortContext/nikjain15');
    expect(BUS.memory('NikJain15')).toBe('cohortContext/nikjain15/memory');
    expect(BUS.activity('NikJain15')).toBe('cohortContext/nikjain15/activity');
    expect(BUS.tasks).toBe('agentTasks');
  });
});

describe('agent-to-agent task lifecycle', () => {
  it('a fresh task is pending, handle-normalized, with a payload default', () => {
    const t = newAgentTask({ fromApp: 'rally', toApp: 'pulse', handle: 'NikJain15', intent: 'summarize_week' }, 1000);
    expect(t).toMatchObject({ fromApp: 'rally', toApp: 'pulse', handle: 'nikjain15', status: 'pending', payload: {}, result: null });
    expect(t.createdAt).toBe(1000);
  });

  it('only legal transitions are allowed (pending → claimed → done|failed)', () => {
    expect(canTransition('pending', 'claimed')).toBe(true);
    expect(canTransition('claimed', 'done')).toBe(true);
    expect(canTransition('claimed', 'failed')).toBe(true);
    expect(canTransition('pending', 'done')).toBe(false); // must be claimed first
    expect(canTransition('done', 'claimed')).toBe(false); // terminal
    expect(canTransition('failed', 'done')).toBe(false); // terminal
  });
});
