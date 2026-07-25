import { describe, expect, it } from 'vitest';
import { STATUSES, STATUS_LABELS, type Status } from '@/lib/types';
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
  type WorkflowColumn,
} from '@/lib/workflows';

// A tiny well-formed lane set (all three statuses, distinct ids) used across cases.
const wellFormed: WorkflowColumn[] = [
  { id: 'a', label: 'A', status: 'todo' },
  { id: 'b', label: 'B', status: 'in_progress' },
  { id: 'c', label: 'C', status: 'done' },
];

describe('WORKFLOW_PRESETS — structural invariants for every preset', () => {
  it('exposes at least the six documented journeys', () => {
    expect(WORKFLOW_PRESETS.length).toBeGreaterThanOrEqual(6);
  });

  it('every preset has a non-empty id, name, and blurb', () => {
    for (const p of WORKFLOW_PRESETS) {
      expect(p.id.length, `${p.id} empty id`).toBeGreaterThan(0);
      expect(p.name.trim().length, `${p.id} empty name`).toBeGreaterThan(0);
      expect(p.blurb.trim().length, `${p.id} empty blurb`).toBeGreaterThan(0);
    }
  });

  it('every preset id is globally unique across the list', () => {
    const ids = WORKFLOW_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every preset name is globally unique (case-insensitively)', () => {
    const names = WORKFLOW_PRESETS.map((p) => p.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('no preset id collides with another preset name (avoids ambiguous findPreset)', () => {
    for (const p of WORKFLOW_PRESETS) {
      for (const q of WORKFLOW_PRESETS) {
        if (p === q) continue;
        expect(p.id.toLowerCase(), `${p.id} id equals ${q.name} name`).not.toBe(q.name.toLowerCase());
      }
    }
  });

  it('every lane in every preset carries a canonical status value', () => {
    for (const p of WORKFLOW_PRESETS) {
      for (const c of p.columns) {
        expect(STATUSES).toContain(c.status);
      }
    }
  });

  it('every lane has a non-empty id and label', () => {
    for (const p of WORKFLOW_PRESETS) {
      for (const c of p.columns) {
        expect(c.id.length, `${p.id}/${c.id} empty id`).toBeGreaterThan(0);
        expect(c.label.trim().length, `${p.id}/${c.id} empty label`).toBeGreaterThan(0);
      }
    }
  });

  it('every preset is well-formed (covers all three statuses)', () => {
    for (const p of WORKFLOW_PRESETS) expect(isWellFormed(p.columns)).toBe(true);
  });

  it('lanes within a preset are ordered todo → in_progress → done (never regress)', () => {
    const rank: Record<Status, number> = { todo: 0, in_progress: 1, done: 2 };
    for (const p of WORKFLOW_PRESETS) {
      const ranks = p.columns.map((c) => rank[c.status]);
      const sorted = [...ranks].sort((x, y) => x - y);
      expect(ranks, `${p.id} lanes are not status-monotonic`).toEqual(sorted);
    }
  });

  it('the first preset is the classic preset', () => {
    expect(WORKFLOW_PRESETS[0].id).toBe('classic');
  });
});

describe('CLASSIC_COLUMNS — the default lens', () => {
  it('is exactly the classic preset columns (same reference)', () => {
    expect(CLASSIC_COLUMNS).toBe(WORKFLOW_PRESETS[0].columns);
  });

  it('has exactly three lanes, one per status in canonical order', () => {
    expect(CLASSIC_COLUMNS.map((c) => c.status)).toEqual([...STATUSES]);
  });

  it('lane labels match the canonical status labels', () => {
    expect(CLASSIC_COLUMNS[0].label).toBe(STATUS_LABELS.todo);
    expect(CLASSIC_COLUMNS[1].label).toBe(STATUS_LABELS.in_progress);
    expect(CLASSIC_COLUMNS[2].label).toBe(STATUS_LABELS.done);
  });

  it('is itself well-formed', () => {
    expect(isWellFormed(CLASSIC_COLUMNS)).toBe(true);
  });
});

describe('isWellFormed — coverage of all three statuses', () => {
  it('rejects an empty column list', () => {
    expect(isWellFormed([])).toBe(false);
  });

  it('rejects a set missing exactly one status (done)', () => {
    expect(
      isWellFormed([
        { id: 'x', label: 'x', status: 'todo' },
        { id: 'y', label: 'y', status: 'in_progress' },
      ])
    ).toBe(false);
  });

  it('rejects a set missing in_progress', () => {
    expect(
      isWellFormed([
        { id: 'x', label: 'x', status: 'todo' },
        { id: 'y', label: 'y', status: 'done' },
      ])
    ).toBe(false);
  });

  it('rejects a single-lane set', () => {
    expect(isWellFormed([{ id: 'x', label: 'x', status: 'in_progress' }])).toBe(false);
  });

  it('accepts a minimal one-lane-per-status set', () => {
    expect(isWellFormed(wellFormed)).toBe(true);
  });

  it('accepts duplicate lanes for the same status as long as all three are covered', () => {
    expect(
      isWellFormed([
        { id: 'a', label: 'a', status: 'todo' },
        { id: 'a2', label: 'a2', status: 'todo' },
        { id: 'b', label: 'b', status: 'in_progress' },
        { id: 'c', label: 'c', status: 'done' },
      ])
    ).toBe(true);
  });

  it('does not care about lane order for well-formedness', () => {
    expect(
      isWellFormed([
        { id: 'c', label: 'c', status: 'done' },
        { id: 'a', label: 'a', status: 'todo' },
        { id: 'b', label: 'b', status: 'in_progress' },
      ])
    ).toBe(true);
  });
});

describe('columnsOrDefault — migration to classic on any bad input', () => {
  it('null → classic (identity reference)', () => {
    expect(columnsOrDefault(null)).toBe(CLASSIC_COLUMNS);
  });

  it('undefined → classic', () => {
    expect(columnsOrDefault(undefined)).toBe(CLASSIC_COLUMNS);
  });

  it('a view with empty columns → classic', () => {
    const v: BoardView = { preset: 'x', columns: [], placement: {} };
    expect(columnsOrDefault(v)).toBe(CLASSIC_COLUMNS);
  });

  it('a view missing a status → classic', () => {
    const v: BoardView = {
      preset: 'x',
      columns: [
        { id: 'a', label: 'a', status: 'todo' },
        { id: 'b', label: 'b', status: 'in_progress' },
      ],
      placement: {},
    };
    expect(columnsOrDefault(v)).toBe(CLASSIC_COLUMNS);
  });

  it('a well-formed custom view is returned as-is (its own columns reference)', () => {
    const v: BoardView = { preset: 'custom', columns: wellFormed, placement: {} };
    expect(columnsOrDefault(v)).toBe(v.columns);
  });

  it('a well-formed view returns columns that pass isWellFormed', () => {
    const v: BoardView = { preset: 'custom', columns: wellFormed, placement: {} };
    expect(isWellFormed(columnsOrDefault(v))).toBe(true);
  });

  it('the returned classic fallback is itself well-formed and classic', () => {
    const out = columnsOrDefault(null);
    expect(isWellFormed(out)).toBe(true);
    expect(isClassic(out)).toBe(true);
  });
});

describe('isClassic — the pinned-board signal', () => {
  it('true for CLASSIC_COLUMNS', () => {
    expect(isClassic(CLASSIC_COLUMNS)).toBe(true);
  });

  it('true for any three-lane set matching status-by-position, regardless of ids/labels', () => {
    expect(
      isClassic([
        { id: 'zzz', label: 'renamed todo', status: 'todo' },
        { id: 'yyy', label: 'renamed doing', status: 'in_progress' },
        { id: 'xxx', label: 'renamed done', status: 'done' },
      ])
    ).toBe(true);
  });

  it('false when a status is out of canonical order', () => {
    expect(
      isClassic([
        { id: 'a', label: 'a', status: 'in_progress' },
        { id: 'b', label: 'b', status: 'todo' },
        { id: 'c', label: 'c', status: 'done' },
      ])
    ).toBe(false);
  });

  it('false for a longer, multi-lane workflow', () => {
    const soft = WORKFLOW_PRESETS.find((p) => p.id === 'software')!;
    expect(isClassic(soft.columns)).toBe(false);
  });

  it('false for an empty set (wrong length)', () => {
    expect(isClassic([])).toBe(false);
  });

  it('false for a two-lane set even if statuses prefix-match', () => {
    expect(
      isClassic([
        { id: 'a', label: 'a', status: 'todo' },
        { id: 'b', label: 'b', status: 'in_progress' },
      ])
    ).toBe(false);
  });

  it('false for a four-lane set whose first three match classic', () => {
    expect(
      isClassic([
        { id: 'a', label: 'a', status: 'todo' },
        { id: 'b', label: 'b', status: 'in_progress' },
        { id: 'c', label: 'c', status: 'done' },
        { id: 'd', label: 'd', status: 'done' },
      ])
    ).toBe(false);
  });

  it('every non-classic preset is NOT classic', () => {
    for (const p of WORKFLOW_PRESETS) {
      if (p.id === 'classic') continue;
      expect(isClassic(p.columns), `${p.id} wrongly reads as classic`).toBe(false);
    }
  });
});

describe('resolveColumnId — advisory, self-healing placement', () => {
  const soft = WORKFLOW_PRESETS.find((p) => p.id === 'software')!.columns;

  it('unplaced todo card → first todo lane (backlog)', () => {
    expect(resolveColumnId({ id: 't', status: 'todo' }, soft, {})).toBe('backlog');
  });

  it('unplaced in_progress card → first in_progress lane (building)', () => {
    expect(resolveColumnId({ id: 't', status: 'in_progress' }, soft, {})).toBe('building');
  });

  it('unplaced done card → first done lane (shipped)', () => {
    expect(resolveColumnId({ id: 't', status: 'done' }, soft, {})).toBe('shipped');
  });

  it('honours a placement into a non-first lane of the matching status', () => {
    expect(resolveColumnId({ id: 't', status: 'todo' }, soft, { t: 'designing' })).toBe('designing');
    expect(resolveColumnId({ id: 't', status: 'in_progress' }, soft, { t: 'deploying' })).toBe('deploying');
  });

  it('honours a placement into the first lane of the matching status', () => {
    expect(resolveColumnId({ id: 't', status: 'in_progress' }, soft, { t: 'building' })).toBe('building');
  });

  it('self-heals a stale placement: lane status ≠ card status → first lane of card status', () => {
    // placed in "backlog" (todo) but the card is now in_progress
    expect(resolveColumnId({ id: 't', status: 'in_progress' }, soft, { t: 'backlog' })).toBe('building');
  });

  it('self-heals when card jumps from in_progress lane to done', () => {
    expect(resolveColumnId({ id: 't', status: 'done' }, soft, { t: 'review' })).toBe('shipped');
  });

  it('ignores a placement referencing a lane id that does not exist', () => {
    expect(resolveColumnId({ id: 't', status: 'todo' }, soft, { t: 'ghost-lane' })).toBe('backlog');
  });

  it('ignores a placement belonging to a DIFFERENT task id', () => {
    expect(resolveColumnId({ id: 't', status: 'todo' }, soft, { other: 'designing' })).toBe('backlog');
  });

  it('placement empty-string lane id is falsy → falls through to first lane', () => {
    expect(resolveColumnId({ id: 't', status: 'todo' }, soft, { t: '' })).toBe('backlog');
  });

  it('resolves the right task among many placements', () => {
    const placement = { a: 'designing', t: 'review', z: 'backlog' };
    expect(resolveColumnId({ id: 't', status: 'in_progress' }, soft, placement)).toBe('review');
  });

  it('falls back to the first lane overall when no lane matches the status (custom set missing the status)', () => {
    // A degenerate set with no done lane; a done card has no status lane → first column overall.
    const noDone: WorkflowColumn[] = [
      { id: 'a', label: 'a', status: 'todo' },
      { id: 'b', label: 'b', status: 'in_progress' },
    ];
    expect(resolveColumnId({ id: 't', status: 'done' }, noDone, {})).toBe('a');
  });

  it('falls back to the raw status string when columns is empty', () => {
    expect(resolveColumnId({ id: 't', status: 'done' }, [], {})).toBe('done');
  });

  it('an empty-columns set ignores any placement and returns the status', () => {
    expect(resolveColumnId({ id: 't', status: 'todo' }, [], { t: 'anything' })).toBe('todo');
  });

  it('picks the FIRST of several lanes sharing the card status when unplaced', () => {
    const twoTodo: WorkflowColumn[] = [
      { id: 'first-todo', label: 'x', status: 'todo' },
      { id: 'second-todo', label: 'y', status: 'todo' },
      { id: 'ip', label: 'z', status: 'in_progress' },
      { id: 'dn', label: 'w', status: 'done' },
    ];
    expect(resolveColumnId({ id: 't', status: 'todo' }, twoTodo, {})).toBe('first-todo');
  });

  it('works across every preset: an unplaced card always resolves to a real lane of its status', () => {
    for (const p of WORKFLOW_PRESETS) {
      for (const s of STATUSES) {
        const laneId = resolveColumnId({ id: 't', status: s }, p.columns, {});
        const lane = p.columns.find((c) => c.id === laneId);
        expect(lane, `${p.id}/${s} resolved to unknown lane`).toBeDefined();
        expect(lane!.status, `${p.id}/${s} resolved lane has wrong status`).toBe(s);
      }
    }
  });
});

describe('planLaneMove — status write vs private re-file', () => {
  const soft = WORKFLOW_PRESETS.find((p) => p.id === 'software')!.columns;
  const backlog = soft.find((c) => c.id === 'backlog')!; // todo
  const designing = soft.find((c) => c.id === 'designing')!; // todo
  const building = soft.find((c) => c.id === 'building')!; // in_progress
  const review = soft.find((c) => c.id === 'review')!; // in_progress
  const shipped = soft.find((c) => c.id === 'shipped')!; // done

  it('same-status move (todo→todo, different lane) is a private re-file: status null', () => {
    expect(planLaneMove({ id: 't', status: 'todo' }, designing)).toEqual({ status: null, laneId: 'designing' });
  });

  it('same-status move within in_progress (building→review) writes no status', () => {
    expect(planLaneMove({ id: 't', status: 'in_progress' }, review)).toEqual({ status: null, laneId: 'review' });
  });

  it('moving into the SAME lane the card already occupies is still status null', () => {
    expect(planLaneMove({ id: 't', status: 'in_progress' }, building)).toEqual({ status: null, laneId: 'building' });
  });

  it('cross-status move todo→in_progress writes the new canonical status', () => {
    expect(planLaneMove({ id: 't', status: 'todo' }, building)).toEqual({ status: 'in_progress', laneId: 'building' });
  });

  it('cross-status move in_progress→done writes done', () => {
    expect(planLaneMove({ id: 't', status: 'in_progress' }, shipped)).toEqual({ status: 'done', laneId: 'shipped' });
  });

  it('cross-status backward move (done→todo) writes todo (regressions allowed)', () => {
    expect(planLaneMove({ id: 't', status: 'done' }, backlog)).toEqual({ status: 'todo', laneId: 'backlog' });
  });

  it('the laneId in the plan is always the target lane id, both branches', () => {
    expect(planLaneMove({ id: 't', status: 'done' }, review).laneId).toBe('review');
    expect(planLaneMove({ id: 't', status: 'in_progress' }, review).laneId).toBe('review');
  });

  it('status is null IFF target status equals current status, across every pair', () => {
    const lanes = [backlog, designing, building, review, shipped];
    for (const from of STATUSES) {
      for (const target of lanes) {
        const plan = planLaneMove({ id: 't', status: from }, target);
        if (target.status === from) {
          expect(plan.status).toBeNull();
        } else {
          expect(plan.status).toBe(target.status);
        }
        expect(plan.laneId).toBe(target.id);
      }
    }
  });
});

describe('findPreset — id / name matching', () => {
  it('matches by exact id', () => {
    expect(findPreset('research')?.id).toBe('research');
    expect(findPreset('pipeline')?.id).toBe('pipeline');
  });

  it('matches by id case-insensitively', () => {
    expect(findPreset('RESEARCH')?.id).toBe('research');
    expect(findPreset('ReSeArCh')?.id).toBe('research');
  });

  it('matches by exact name', () => {
    expect(findPreset('Sales pipeline')?.id).toBe('pipeline');
    expect(findPreset('Content pipeline')?.id).toBe('content');
  });

  it('matches by name case-insensitively', () => {
    expect(findPreset('sales pipeline')?.id).toBe('pipeline');
    expect(findPreset('CONTENT PIPELINE')?.id).toBe('content');
  });

  it('trims surrounding whitespace before matching', () => {
    expect(findPreset('   research   ')?.id).toBe('research');
    expect(findPreset('\t Sales pipeline \n')?.id).toBe('pipeline');
  });

  it('returns undefined for an unknown token', () => {
    expect(findPreset('does-not-exist')).toBeUndefined();
  });

  it('returns undefined for an empty / whitespace-only string', () => {
    expect(findPreset('')).toBeUndefined();
    expect(findPreset('    ')).toBeUndefined();
  });

  it('does NOT match on a partial / substring of a name', () => {
    expect(findPreset('sales')).toBeUndefined();
    expect(findPreset('pipel')).toBeUndefined();
  });

  it('does not collapse internal whitespace (exact spacing required)', () => {
    expect(findPreset('Sales  pipeline')).toBeUndefined(); // double space inside
  });

  it('resolves every preset by its own id and by its own name', () => {
    for (const p of WORKFLOW_PRESETS) {
      expect(findPreset(p.id)?.id).toBe(p.id);
      expect(findPreset(p.name)?.id).toBe(p.id);
      expect(findPreset(p.name.toUpperCase())?.id).toBe(p.id);
    }
  });
});

describe('presetById — strict id lookup', () => {
  it('returns the matching preset', () => {
    expect(presetById('design')?.name).toBe('Design');
    expect(presetById('classic')?.name).toBe('Classic');
  });

  it('is case-sensitive (unlike findPreset)', () => {
    expect(presetById('DESIGN')).toBeUndefined();
    expect(presetById('Design')).toBeUndefined(); // id is lowercase "design"
  });

  it('does not match on name', () => {
    expect(presetById('Sales pipeline')).toBeUndefined();
  });

  it('returns undefined for unknown id and empty string', () => {
    expect(presetById('nope')).toBeUndefined();
    expect(presetById('')).toBeUndefined();
  });

  it('resolves every preset by its exact id', () => {
    for (const p of WORKFLOW_PRESETS) expect(presetById(p.id)).toBe(p);
  });
});
