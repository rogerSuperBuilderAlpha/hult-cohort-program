import { describe, expect, it } from 'vitest';
import { STATUSES } from '@/lib/types';
import {
  CLASSIC_COLUMNS,
  columnsOrDefault,
  findPreset,
  isClassic,
  isWellFormed,
  planLaneMove,
  presetById,
  resolveColumnId,
  WORKFLOW_PRESETS,
  type BoardView,
} from '@/lib/workflows';

describe('workflow presets — every journey is complete', () => {
  it('every preset covers all three canonical statuses', () => {
    for (const p of WORKFLOW_PRESETS) {
      expect(isWellFormed(p.columns), `${p.name} leaves a status with no lane`).toBe(true);
      const covered = new Set(p.columns.map((c) => c.status));
      for (const s of STATUSES) expect(covered.has(s), `${p.name} missing ${s}`).toBe(true);
    }
  });

  it('every lane id within a preset is unique', () => {
    for (const p of WORKFLOW_PRESETS) {
      const ids = p.columns.map((c) => c.id);
      expect(new Set(ids).size, `${p.name} has duplicate lane ids`).toBe(ids.length);
    }
  });

  it('the classic preset is exactly the three canonical columns', () => {
    expect(isClassic(CLASSIC_COLUMNS)).toBe(true);
    expect(CLASSIC_COLUMNS.map((c) => c.status)).toEqual(['todo', 'in_progress', 'done']);
  });

  it('finds a preset by id or case-insensitive name', () => {
    expect(findPreset('software')?.id).toBe('software');
    expect(findPreset('Software delivery')?.id).toBe('software');
    expect(findPreset('  SOFTWARE DELIVERY ')?.id).toBe('software');
    expect(findPreset('nonsense')).toBeUndefined();
    expect(presetById('content')?.name).toBe('Content pipeline');
  });
});

describe('columnsOrDefault — the no-op migration', () => {
  it('falls back to classic for no view', () => {
    expect(columnsOrDefault(null)).toBe(CLASSIC_COLUMNS);
    expect(columnsOrDefault(undefined)).toBe(CLASSIC_COLUMNS);
  });

  it('falls back to classic for a malformed (status-incomplete) view', () => {
    const broken: BoardView = {
      preset: 'x',
      columns: [{ id: 'only', label: 'Only todo', status: 'todo' }],
      placement: {},
    };
    expect(columnsOrDefault(broken)).toBe(CLASSIC_COLUMNS);
  });

  it('uses a well-formed view', () => {
    const soft = WORKFLOW_PRESETS.find((p) => p.id === 'software')!;
    const view: BoardView = { preset: 'software', columns: [...soft.columns], placement: {} };
    expect(columnsOrDefault(view)).toBe(view.columns);
  });
});

describe('resolveColumnId — placement is advisory and self-healing', () => {
  const soft = WORKFLOW_PRESETS.find((p) => p.id === 'software')!.columns;

  it('unplaced card falls to the first lane of its status', () => {
    expect(resolveColumnId({ id: 't', status: 'in_progress' }, soft, {})).toBe('building');
    expect(resolveColumnId({ id: 't', status: 'todo' }, soft, {})).toBe('backlog');
  });

  it('honours a placement that matches the card status', () => {
    expect(resolveColumnId({ id: 't', status: 'in_progress' }, soft, { t: 'review' })).toBe('review');
  });

  it('ignores a stale placement whose lane no longer matches the card status', () => {
    // Card was placed in "review" (in_progress) then shipped by a merged PR → now done. The
    // stale placement must not strand it; it falls to the first done lane.
    expect(resolveColumnId({ id: 't', status: 'done' }, soft, { t: 'review' })).toBe('shipped');
  });
});

describe('planLaneMove — status vs private re-file', () => {
  const soft = WORKFLOW_PRESETS.find((p) => p.id === 'software')!.columns;
  const review = soft.find((c) => c.id === 'review')!; // in_progress
  const backlog = soft.find((c) => c.id === 'backlog')!; // todo

  it('same-status move changes only the private lane, no status write', () => {
    const plan = planLaneMove({ id: 't', status: 'in_progress' }, review);
    expect(plan).toEqual({ status: null, laneId: 'review' });
  });

  it('cross-status move updates the canonical status too', () => {
    const plan = planLaneMove({ id: 't', status: 'in_progress' }, backlog);
    expect(plan).toEqual({ status: 'todo', laneId: 'backlog' });
  });
});
