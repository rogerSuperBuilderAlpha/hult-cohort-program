import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isClassic, isWellFormed, type BoardView, type WorkflowColumn } from '@/lib/workflows';

/**
 * Pure unit coverage for lib/board-view.ts `coerce()` — the function that turns a raw,
 * possibly-malformed Firestore doc into a BoardView (or null → classic fallback downstream).
 *
 * coerce() is not exported, so we reach it through its only pure caller,
 * `subscribeToBoardView`: that function passes a `(snap) => cb(coerce(...))` onNext and a
 * `() => cb(null)` onError to `onSnapshot`. We mock firebase so no emulator/network is used,
 * capture those two callbacks, and invoke them with hand-built snapshots. The value handed to
 * `cb` is exactly `coerce`'s output.
 */

// Records every onSnapshot invocation so a test can grab the onNext / onError it registered.
const onSnapshotMock = vi.fn();

vi.mock('@/lib/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
  // board-view.ts calls doc(db, 'boardViews', uid); we only need an opaque handle back.
  doc: vi.fn((...args: unknown[]) => ({ __ref: args })),
  onSnapshot: (...args: unknown[]) => onSnapshotMock(...args),
  setDoc: vi.fn(),
}));

// Imported after the mocks are declared (vi.mock is hoisted above imports regardless).
import { subscribeToBoardView } from '@/lib/board-view';

beforeEach(() => {
  onSnapshotMock.mockReset();
  onSnapshotMock.mockReturnValue(() => {});
});

/** Drive a raw doc `data` (or undefined = "doc does not exist") through coerce and return
 *  whatever the subscriber callback received. */
function coerceDoc(data: Record<string, unknown> | undefined): BoardView | null {
  let received: BoardView | null = undefined as unknown as BoardView | null;
  const cb = vi.fn((v: BoardView | null) => {
    received = v;
  });
  subscribeToBoardView('uid-1', cb);
  const call = onSnapshotMock.mock.calls.at(-1);
  if (!call) throw new Error('onSnapshot was not called');
  const onNext = call[1] as (snap: unknown) => void;
  const snap =
    data === undefined
      ? { exists: () => false, data: () => undefined }
      : { exists: () => true, data: () => data };
  onNext(snap);
  expect(cb).toHaveBeenCalledTimes(1);
  return received;
}

/** Trigger the onError path and return what the subscriber received. */
function triggerError(): BoardView | null {
  let received: BoardView | null = undefined as unknown as BoardView | null;
  const cb = vi.fn((v: BoardView | null) => {
    received = v;
  });
  subscribeToBoardView('uid-err', cb);
  const call = onSnapshotMock.mock.calls.at(-1)!;
  const onError = call[2] as () => void;
  onError();
  return received;
}

// A minimal well-formed lane set: one lane per canonical status. isWellFormed(...) === true.
const fullColumns = (): WorkflowColumn[] => [
  { id: 'a', label: 'A', status: 'todo' },
  { id: 'b', label: 'B', status: 'in_progress' },
  { id: 'c', label: 'C', status: 'done' },
];

describe('coerce — the snapshot / existence gate', () => {
  it('a non-existent doc coerces to null (caller renders classic)', () => {
    expect(coerceDoc(undefined)).toBeNull();
  });

  it('an existing but empty {} doc has no columns and is rejected → null', () => {
    // columns missing → [] → isWellFormed([]) is false.
    expect(coerceDoc({})).toBeNull();
  });

  it('a listener error yields null, never a throw', () => {
    expect(triggerError()).toBeNull();
  });
});

describe('coerce — preset coercion', () => {
  it("missing preset defaults to 'custom'", () => {
    const view = coerceDoc({ columns: fullColumns() });
    expect(view?.preset).toBe('custom');
  });

  it("a non-string preset (number) falls back to 'custom'", () => {
    const view = coerceDoc({ preset: 42, columns: fullColumns() });
    expect(view?.preset).toBe('custom');
  });

  it("a null preset falls back to 'custom'", () => {
    const view = coerceDoc({ preset: null, columns: fullColumns() });
    expect(view?.preset).toBe('custom');
  });

  it('a valid string preset is preserved verbatim', () => {
    const view = coerceDoc({ preset: 'software', columns: fullColumns() });
    expect(view?.preset).toBe('software');
  });

  it("an empty-string preset is kept as '' (it is a string) — not normalised to custom", () => {
    // Documents current behaviour: the guard is `typeof preset === 'string'`, and '' passes.
    const view = coerceDoc({ preset: '', columns: fullColumns() });
    expect(view?.preset).toBe('');
  });
});

describe('coerce — columns: array shape', () => {
  it('columns missing entirely → rejected (no lanes)', () => {
    expect(coerceDoc({ preset: 'x' })).toBeNull();
  });

  it('columns as a non-array object → treated as empty → null', () => {
    expect(coerceDoc({ columns: { 0: fullColumns()[0] } })).toBeNull();
  });

  it('columns as null → treated as empty → null', () => {
    expect(coerceDoc({ columns: null })).toBeNull();
  });

  it('columns as a string → treated as empty → null', () => {
    expect(coerceDoc({ columns: 'todo,doing,done' })).toBeNull();
  });

  it('columns as an empty array → not well-formed → null', () => {
    expect(coerceDoc({ columns: [] })).toBeNull();
  });
});

describe('coerce — columns: per-lane validation (bad lanes are dropped)', () => {
  it('drops a lane missing its id', () => {
    const cols = fullColumns();
    const bad = [{ label: 'No id', status: 'todo' }, ...cols];
    const view = coerceDoc({ columns: bad });
    expect(view).not.toBeNull();
    expect(view!.columns).toHaveLength(3);
    expect(view!.columns.every((c) => typeof c.id === 'string' && c.id.length > 0)).toBe(true);
  });

  it('drops a lane whose id is not a string', () => {
    const bad = [{ id: 7, label: 'Numeric id', status: 'todo' }, ...fullColumns()];
    const view = coerceDoc({ columns: bad });
    expect(view!.columns).toHaveLength(3);
  });

  it('drops a lane whose label is not a string', () => {
    const bad = [{ id: 'x', label: 99, status: 'todo' }, ...fullColumns()];
    const view = coerceDoc({ columns: bad });
    expect(view!.columns).toHaveLength(3);
  });

  it('drops a lane with an unknown status', () => {
    const bad = [{ id: 'x', label: 'Blocked', status: 'blocked' }, ...fullColumns()];
    const view = coerceDoc({ columns: bad });
    expect(view!.columns).toHaveLength(3);
    expect(view!.columns.some((c) => c.status === ('blocked' as unknown))).toBe(false);
  });

  it('drops a lane whose status is missing', () => {
    const bad = [{ id: 'x', label: 'No status' }, ...fullColumns()];
    const view = coerceDoc({ columns: bad });
    expect(view!.columns).toHaveLength(3);
  });

  it('drops a null lane', () => {
    const bad = [null, ...fullColumns()];
    const view = coerceDoc({ columns: bad });
    expect(view!.columns).toHaveLength(3);
  });

  it('drops a primitive (string) lane', () => {
    const bad = ['todo', ...fullColumns()];
    const view = coerceDoc({ columns: bad });
    expect(view!.columns).toHaveLength(3);
  });

  it('drops an array-shaped lane (typeof array is object, but it lacks id/label/status)', () => {
    const bad = [['a', 'b'], ...fullColumns()];
    const view = coerceDoc({ columns: bad });
    expect(view!.columns).toHaveLength(3);
  });
});

describe('coerce — columns: well-formedness gate (must cover all three statuses)', () => {
  it('a set missing the done status is rejected → null', () => {
    const cols: WorkflowColumn[] = [
      { id: 'a', label: 'A', status: 'todo' },
      { id: 'b', label: 'B', status: 'in_progress' },
    ];
    expect(isWellFormed(cols)).toBe(false);
    expect(coerceDoc({ columns: cols })).toBeNull();
  });

  it('a set with only todo lanes is rejected → null', () => {
    const cols = [
      { id: 'a', label: 'A', status: 'todo' },
      { id: 'a2', label: 'A2', status: 'todo' },
    ];
    expect(coerceDoc({ columns: cols })).toBeNull();
  });

  it('when the only done-status lane is malformed, coverage is lost → null', () => {
    // The done lane is dropped by per-lane validation, leaving todo+in_progress → not well-formed.
    const cols = [
      { id: 'a', label: 'A', status: 'todo' },
      { id: 'b', label: 'B', status: 'in_progress' },
      { id: 'c', label: 'C', status: 'shipped' }, // invalid status → dropped
    ];
    expect(coerceDoc({ columns: cols })).toBeNull();
  });

  it('a valid set survives even when extra junk lanes are interleaved', () => {
    const cols = [
      null,
      { id: 'a', label: 'A', status: 'todo' },
      'garbage',
      { id: 'b', label: 'B', status: 'in_progress' },
      { id: 'bad', status: 'done' }, // missing label → dropped
      { id: 'c', label: 'C', status: 'done' },
    ];
    const view = coerceDoc({ columns: cols });
    expect(view).not.toBeNull();
    expect(view!.columns.map((c) => c.id)).toEqual(['a', 'b', 'c']);
    expect(isWellFormed(view!.columns)).toBe(true);
  });

  it('preserves multiple lanes per status and their left-to-right order', () => {
    const cols: WorkflowColumn[] = [
      { id: 'backlog', label: 'Backlog', status: 'todo' },
      { id: 'design', label: 'Designing', status: 'todo' },
      { id: 'build', label: 'Building', status: 'in_progress' },
      { id: 'review', label: 'In review', status: 'in_progress' },
      { id: 'shipped', label: 'Shipped', status: 'done' },
    ];
    const view = coerceDoc({ columns: cols });
    expect(view!.columns).toEqual(cols);
    expect(isClassic(view!.columns)).toBe(false);
  });
});

describe('coerce — placement map coercion', () => {
  it('missing placement becomes an empty map', () => {
    const view = coerceDoc({ columns: fullColumns() });
    expect(view!.placement).toEqual({});
  });

  it('placement null becomes an empty map', () => {
    const view = coerceDoc({ columns: fullColumns(), placement: null });
    expect(view!.placement).toEqual({});
  });

  it('placement as a non-object (string) becomes an empty map', () => {
    const view = coerceDoc({ columns: fullColumns(), placement: 'nope' });
    expect(view!.placement).toEqual({});
  });

  it('keeps only string-valued entries; drops number/null/boolean/object values', () => {
    const view = coerceDoc({
      columns: fullColumns(),
      placement: {
        t1: 'lane-a',
        t2: 42,
        t3: null,
        t4: true,
        t5: { nested: 'x' },
        t6: 'lane-b',
      },
    });
    expect(view!.placement).toEqual({ t1: 'lane-a', t6: 'lane-b' });
  });

  it('an all-strings placement round-trips untouched', () => {
    const placement = { taskA: 'lane-a', taskB: 'lane-b', taskC: 'lane-c' };
    const view = coerceDoc({ columns: fullColumns(), placement });
    expect(view!.placement).toEqual(placement);
  });

  it("keeps an empty-string lane value (it is a string) — an edge worth pinning", () => {
    const view = coerceDoc({ columns: fullColumns(), placement: { t1: '' } });
    expect(view!.placement).toEqual({ t1: '' });
  });

  it('placement given as an array of strings yields numeric-string keys (Object.entries quirk)', () => {
    // typeof [] === 'object', so the loop runs over indices → { '0': 'x', '1': 'y' }.
    const view = coerceDoc({ columns: fullColumns(), placement: ['x', 'y'] });
    expect(view!.placement).toEqual({ '0': 'x', '1': 'y' });
  });
});

describe('coerce — a well-formed doc round-trips faithfully', () => {
  it('preserves preset, columns, and placement exactly', () => {
    const doc = {
      preset: 'software',
      columns: fullColumns(),
      placement: { task1: 'a', task2: 'c' },
    };
    const view = coerceDoc(doc);
    expect(view).toEqual({
      preset: 'software',
      columns: fullColumns(),
      placement: { task1: 'a', task2: 'c' },
    });
  });

  it('the coerced view is accepted by isWellFormed (safe to render as-is)', () => {
    const view = coerceDoc({ preset: 'custom', columns: fullColumns(), placement: {} });
    expect(view).not.toBeNull();
    expect(isWellFormed(view!.columns)).toBe(true);
  });
});

describe('subscribeToBoardView — wiring', () => {
  it('returns the unsubscribe function produced by onSnapshot', () => {
    const unsub = () => {};
    onSnapshotMock.mockReturnValue(unsub);
    const cb = vi.fn();
    const returned = subscribeToBoardView('uid-2', cb);
    expect(returned).toBe(unsub);
  });

  it('registers exactly one listener per call with both a next and an error handler', () => {
    subscribeToBoardView('uid-3', vi.fn());
    const call = onSnapshotMock.mock.calls.at(-1)!;
    expect(typeof call[1]).toBe('function'); // onNext
    expect(typeof call[2]).toBe('function'); // onError
  });
});
