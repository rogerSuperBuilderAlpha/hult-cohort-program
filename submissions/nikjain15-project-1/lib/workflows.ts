import { STATUSES, STATUS_LABELS, type Status } from './types';

/**
 * Workflow lanes — a per-user, private LENS over the board. design: richer workflow (#3).
 *
 * The board has exactly three canonical statuses (`todo` / `in_progress` / `done`) and that
 * never changes: the sensor only ever writes `status`, the cohort board is those three
 * columns, and the pinned responsive/crud specs assert on them. A workflow does NOT add new
 * statuses. It sub-divides the three you have into named lanes that reflect a real journey —
 * "backlog → design → build → review → deploy → shipped" — where every lane still maps down
 * onto one of the three canonical statuses.
 *
 * Two invariants make this safe:
 *  - **It's private.** A workflow (and each card's lane placement within it) lives in the
 *    user's own `boardViews/{uid}` doc. Nobody else sees your lanes; the shared truth about a
 *    card is only its canonical `status`. So a lane is a lens, never a fact about the card.
 *  - **It degrades to today's board.** No workflow (`undefined`) means the classic three
 *    columns, unchanged byte-for-byte. Migration is a no-op.
 *
 * Because a lane is private, a card's placement in a finer lane is stored in the user's own
 * doc, keyed by task id — never on the shared task. Canonical `status` stays the one shared,
 * sensor-owned truth; lanes only decide which sub-column a card of that status shows in, and
 * only for you.
 */

/** One display column. `status` is which canonical status every card in this lane really has;
 *  `label` is what the user reads; `id` is stable, referenced by a card's placement. */
export type WorkflowColumn = { id: string; label: string; status: Status };

/** A per-user board view: the chosen lanes, plus which lane each card sits in (advisory —
 *  ignored the moment a card's real status no longer matches, so it self-heals). */
export type BoardView = {
  /** The id of the chosen preset, or a marker for a custom set. Purely informational. */
  preset: string;
  /** The lanes, left to right. Must cover all three statuses (see `isWellFormed`). */
  columns: WorkflowColumn[];
  /** taskId -> lane id. Absent for a card that's never been placed; it falls to the first
   *  lane of its status. Self-healing: a stale entry (lane's status ≠ card's status) is
   *  ignored on resolve, so a sensor/peer status change never strands a card. */
  placement: Record<string, string>;
};

const col = (id: string, label: string, status: Status): WorkflowColumn => ({ id, label, status });

/** A preset the user can pick — a ready-made end-to-end journey, so nobody faces a blank
 *  column builder. `name` is what the picker and the agent match on (case-insensitively). */
export type WorkflowPreset = { id: string; name: string; blurb: string; columns: WorkflowColumn[] };

/**
 * The pre-built journeys. Each is a complete, common end-to-end flow, and each covers all
 * three canonical statuses (asserted in tests). Keep labels plain and lowercase-friendly —
 * the board renders them the same way it renders the classic ones (VOICE: plain, warm).
 */
export const WORKFLOW_PRESETS: readonly WorkflowPreset[] = [
  {
    id: 'classic',
    name: 'Classic',
    blurb: 'To do, in progress, done. The board you already know.',
    columns: [col('todo', STATUS_LABELS.todo, 'todo'), col('doing', STATUS_LABELS.in_progress, 'in_progress'), col('done', STATUS_LABELS.done, 'done')],
  },
  {
    id: 'software',
    name: 'Software delivery',
    blurb: 'Backlog to shipped, the whole engineering journey.',
    columns: [
      col('backlog', 'Backlog', 'todo'),
      col('designing', 'Designing', 'todo'),
      col('building', 'Building', 'in_progress'),
      col('review', 'In review', 'in_progress'),
      col('deploying', 'Deploying', 'in_progress'),
      col('shipped', 'Shipped', 'done'),
    ],
  },
  {
    id: 'content',
    name: 'Content pipeline',
    blurb: 'From an idea to something published.',
    columns: [
      col('ideas', 'Ideas', 'todo'),
      col('outlined', 'Outlined', 'todo'),
      col('drafting', 'Drafting', 'in_progress'),
      col('editing', 'Editing', 'in_progress'),
      col('published', 'Published', 'done'),
    ],
  },
  {
    id: 'research',
    name: 'Research',
    blurb: 'Open questions through to answered.',
    columns: [
      col('questions', 'Questions', 'todo'),
      col('investigating', 'Investigating', 'in_progress'),
      col('synthesizing', 'Synthesizing', 'in_progress'),
      col('answered', 'Answered', 'done'),
    ],
  },
  {
    id: 'design',
    name: 'Design',
    blurb: 'Requests through to delivered.',
    columns: [
      col('requests', 'Requests', 'todo'),
      col('exploring', 'Exploring', 'in_progress'),
      col('critique', 'Critique', 'in_progress'),
      col('delivered', 'Delivered', 'done'),
    ],
  },
  {
    id: 'pipeline',
    name: 'Sales pipeline',
    blurb: 'Leads through to won.',
    columns: [
      col('leads', 'Leads', 'todo'),
      col('qualified', 'Qualified', 'todo'),
      col('proposal', 'Proposal', 'in_progress'),
      col('negotiating', 'Negotiating', 'in_progress'),
      col('won', 'Won', 'done'),
    ],
  },
] as const;

/** The default lanes — exactly the three classic columns. Used when a user has no workflow. */
export const CLASSIC_COLUMNS: readonly WorkflowColumn[] = WORKFLOW_PRESETS[0].columns;

export function presetById(id: string): WorkflowPreset | undefined {
  return WORKFLOW_PRESETS.find((p) => p.id === id);
}

/** Match a preset by id or (case-insensitive) name — what the agent resolves a spoken name
 *  against ("switch to the software workflow" -> the `software` preset). */
export function findPreset(nameOrId: string): WorkflowPreset | undefined {
  const q = nameOrId.trim().toLowerCase();
  return WORKFLOW_PRESETS.find((p) => p.id.toLowerCase() === q || p.name.toLowerCase() === q);
}

/**
 * A set of lanes is usable only if every canonical status has at least one lane — otherwise a
 * card in an uncovered status would have nowhere to render and would silently vanish. Every
 * preset must pass this (a test enforces it), and a `BoardView` loaded from storage is run
 * through `columnsOrDefault` which falls back to classic if it doesn't.
 */
export function isWellFormed(columns: readonly WorkflowColumn[]): boolean {
  if (columns.length === 0) return false;
  const covered = new Set(columns.map((c) => c.status));
  return STATUSES.every((s) => covered.has(s));
}

/** The lanes to render: the user's, if present and well-formed; otherwise the classic three.
 *  This is the no-op migration — `undefined` (no doc) yields today's board exactly. */
export function columnsOrDefault(view: BoardView | null | undefined): readonly WorkflowColumn[] {
  if (view && isWellFormed(view.columns)) return view.columns;
  return CLASSIC_COLUMNS;
}

/** True when the view is just the classic three columns — the signal to render the original,
 *  pinned three-column board path rather than the dynamic one. */
export function isClassic(columns: readonly WorkflowColumn[]): boolean {
  return (
    columns.length === CLASSIC_COLUMNS.length &&
    columns.every((c, i) => c.status === CLASSIC_COLUMNS[i].status)
  );
}

/**
 * Which lane a card shows in, given the user's placement. The placement is advisory: it only
 * counts if the placed lane actually has the card's current status. A card never placed, or
 * whose status moved out from under an old placement, falls to the FIRST lane of its status —
 * so a sensor sync or a peer's status change can never strand it in the wrong sub-column.
 */
export function resolveColumnId(
  task: { id: string; status: Status },
  columns: readonly WorkflowColumn[],
  placement: Record<string, string>
): string {
  const forStatus = columns.filter((c) => c.status === task.status);
  const placedId = placement[task.id];
  if (placedId && forStatus.some((c) => c.id === placedId)) return placedId;
  return forStatus[0]?.id ?? columns[0]?.id ?? task.status;
}

/**
 * Plan a card's move into a target lane. Two outcomes, and the split is the whole safety of
 * the model:
 *  - The lane belongs to a DIFFERENT canonical status → the card's real status changes. That
 *    goes through `setTaskStatus` (the shared, logged, sensor-consistent path) AND records the
 *    new lane in the private placement.
 *  - The lane belongs to the SAME status → nothing shared changes. Only the private placement
 *    moves. No status write, no feed event — a purely cosmetic re-file in your own lens.
 */
export function planLaneMove(
  task: { id: string; status: Status },
  target: WorkflowColumn
): { status: Status | null; laneId: string } {
  return { status: target.status === task.status ? null : target.status, laneId: target.id };
}
