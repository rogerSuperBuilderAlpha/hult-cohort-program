'use client';

import { useEffect, useMemo, useState } from 'react';
import { setTaskStatus } from '@/lib/data';
import { STATUS_LABELS, STATUSES, type Member, type Project, type Status, type Task } from '@/lib/types';
import { TaskCard } from './TaskCard';

type Actor = { uid: string; name: string; photoURL: string | null };

/**
 * The board. Three columns, and the hard case in the whole responsive pass.
 *
 * Under 768 it is a horizontally scroll-snapped carousel with a peek — it does NOT stack.
 * Stacking destroys the only thing a kanban is for: seeing flow across states. The peek is
 * what tells you there are more columns to the right.
 *
 * At 768 the grid takes over.
 */
export function Board({
  actor,
  tasks,
  projects,
  members,
  onOpenTask,
  onNewTask,
}: {
  actor: Actor;
  tasks: Task[];
  projects: Project[];
  members: Member[];
  onOpenTask: (task: Task) => void;
  onNewTask: (status: Status) => void;
}) {
  const [dragging, setDragging] = useState<Task | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);
  const [celebrating, setCelebrating] = useState<ReadonlySet<string>>(new Set());

  const projectById = new Map(projects.map((p) => [p.id, p]));
  const memberByUid = new Map(members.map((m) => [m.uid, m]));

  /**
   * A card pulses once when it LANDS in done — however it got there.
   *
   * This used to fire only inside `move()`, the drag/select path, so the only completion
   * that celebrated was one you performed by hand. The product's whole claim is that you
   * don't move the cards: a merged PR that made the board build itself slid into done in
   * total silence, and so did a teammate's card arriving over the listener. The best beat
   * in the product was the one it didn't mark.
   *
   * Watching the data instead of the interaction covers all three at once — your move,
   * Pulse's sync, and a peer's — because they all arrive the same way: as a status change
   * on a snapshot. The manual case still feels instant; Firestore applies local writes
   * before the server round-trip.
   *
   * `seen` is what stops a page load from celebrating every card already finished: it is
   * seeded with the first delivery, so there is nothing to compare against and nothing
   * pulses. Only a transition observed while you're watching counts.
   *
   * Compared during render rather than in an effect — React's documented shape for
   * adjusting state when a prop changes, and it starts the pulse on the same render the
   * card arrives rather than a frame later.
   */
  const [seen, setSeen] = useState<Task[]>(tasks);

  if (tasks !== seen) {
    const before = new Map(seen.map((t) => [t.id, t.status]));
    const landed = tasks
      .filter((t) => {
        const was = before.get(t.id);
        return was !== undefined && was !== 'done' && t.status === 'done';
      })
      .map((t) => t.id);

    setSeen(tasks);
    if (landed.length > 0) setCelebrating((current) => new Set([...current, ...landed]));
  }

  useEffect(() => {
    if (celebrating.size === 0) return;
    // 600ms matches the keyframe. Cleared on unmount so a state write can't land on a
    // board that's already gone.
    const timer = setTimeout(() => setCelebrating(new Set()), 600);
    return () => clearTimeout(timer);
  }, [celebrating]);

  async function move(task: Task, status: Status) {
    if (task.status === status) return;
    await setTaskStatus(actor, task, status);
  }

  /**
   * "Pulse did this" — the self-build made visible, once per card.
   *
   * The board building itself is the product's whole claim, and it used to happen in
   * silence: a sensed card slid in indistinguishable from one you made. The first time
   * YOU see one of YOUR sensed cards, it says so out loud; after that it carries the
   * normal receipt. Seen-state is presentation, so it lives in localStorage (per member,
   * per card), not Firestore.
   *
   * Guardrails: only your own cards (a flourish on a peer's card would be commentary on
   * their pace), facts only (no model sentence, so no consent involved), and a static
   * highlight — no motion, nothing to disable for prefers-reduced-motion.
   */
  // A mount-time snapshot on purpose: persisting below must not hide the flourish
  // mid-session. Lazy state init is the sanctioned "compute once at mount" shape.
  const [seenSensedAtMount] = useState<ReadonlySet<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      return new Set(
        JSON.parse(localStorage.getItem(`pulse:did:${actor.uid}`) ?? '[]') as string[]
      );
    } catch {
      return new Set();
    }
  });

  const pulseDidIds = useMemo(
    () =>
      new Set(
        tasks
          .filter(
            (t) =>
              t.source === 'sensed' && t.assigneeUid === actor.uid && !seenSensedAtMount.has(t.id)
          )
          .map((t) => t.id)
      ),
    [tasks, actor.uid, seenSensedAtMount]
  );

  useEffect(() => {
    if (pulseDidIds.size === 0) return;
    try {
      const key = `pulse:did:${actor.uid}`;
      const stored = new Set(JSON.parse(localStorage.getItem(key) ?? '[]') as string[]);
      pulseDidIds.forEach((id) => stored.add(id));
      localStorage.setItem(key, JSON.stringify([...stored]));
    } catch {
      // Storage unavailable — the flourish just shows again next visit. Harmless.
    }
  }, [pulseDidIds, actor.uid]);

  /** The one line the flourish says. Facts from the card itself, nothing invented. */
  function pulseDidLine(task: Task): string {
    const pr = task.evidence?.prNumbers?.at(-1);
    if (task.status === 'done' && pr) return `Pulse moved this — PR #${pr} merged`;
    if (pr) return `Pulse made this card — PR #${pr}`;
    return 'Pulse made this card from your branch';
  }

  return (
    <div
      className="
        -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2
        min-[768px]:mx-0 min-[768px]:grid min-[768px]:grid-cols-3 min-[768px]:overflow-visible min-[768px]:px-0
        min-[1440px]:gap-5
      "
      data-testid="board"
    >
      {STATUSES.map((status) => {
        const column = tasks.filter((t) => t.status === status);

        return (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              if (dragging) move(dragging, status);
              setDragging(null);
            }}
            // 78% basis + snap-start = the peek. The next column is visibly there.
            className={`
              w-[78%] shrink-0 snap-start rounded-lg border p-3 transition-colors
              min-[480px]:w-[46%] min-[768px]:w-auto
              ${dragOver === status ? 'border-emerald-500/60 bg-zinc-900/60' : 'border-zinc-800 bg-zinc-900/30'}
            `}
            data-column={status}
          >
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-xs text-zinc-400">
                {STATUS_LABELS[status].toLowerCase()} · {column.length}
              </h2>
              <button
                onClick={() => onNewTask(status)}
                aria-label={`New task in ${STATUS_LABELS[status]}`}
                className="text-xs text-zinc-400 transition-colors hover:text-zinc-300"
              >
                +
              </button>
            </header>

            <div className="space-y-2">
              {column.map((task) => (
                <div
                  key={task.id}
                  className={celebrating.has(task.id) ? 'motion-safe:animate-[pulse-once_600ms_ease-out]' : ''}
                >
                  <TaskCard
                    task={task}
                    project={projectById.get(task.projectId)}
                    assignee={task.assigneeUid ? memberByUid.get(task.assigneeUid) : undefined}
                    pulseDid={pulseDidIds.has(task.id) ? pulseDidLine(task) : undefined}
                    onOpen={() => onOpenTask(task)}
                    onStatusChange={(s) => move(task, s)}
                    onDragStart={() => setDragging(task)}
                  />
                </div>
              ))}

              {column.length === 0 && (
                // An empty column is an invitation, not an apology — and "done" quietly
                // states the product's whole promise: finished work arrives on its own.
                <p className="py-6 text-center text-xs text-zinc-400">
                  {status === 'todo' && 'Empty. Hit + and claim the first card.'}
                  {status === 'in_progress' && 'Nothing in flight. Yet.'}
                  {status === 'done' && 'Ship something — it lands here by itself.'}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
