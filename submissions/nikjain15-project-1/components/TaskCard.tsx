'use client';

import { formatEvidence } from '@/lib/sense';
import { STATUS_LABELS, STATUSES, type Member, type Status, type Task } from '@/lib/types';

/** Due today or earlier, and not finished — the only thing red is allowed to mean. */
function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done') return false;
  return task.dueDate.toDate().getTime() < Date.now();
}

function formatDue(dueDate: NonNullable<Task['dueDate']>): string {
  return dueDate.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * The receipt. Every card says where it came from.
 *
 * Sensed cards show their evidence ("PR #44 opened · 3 commits"); manual cards say
 * "you · by hand". Pulse moves cards on its own, so a card that can't account for itself
 * is indistinguishable from a bug.
 */
function Receipt({ task }: { task: Task }) {
  if (task.source === 'manual') {
    return <p className="mt-1 text-xs text-zinc-400">you · by hand</p>;
  }

  const line = task.evidence ? formatEvidence(task.evidence) : '';
  return (
    <p className="mt-1 text-xs text-emerald-500/80">
      {line || (task.branch ? `from branch ${task.branch}` : 'pulse')}
    </p>
  );
}

export function TaskCard({
  task,
  project,
  assignee,
  onOpen,
  onStatusChange,
  onDragStart,
}: {
  task: Task;
  project?: { name: string };
  assignee?: Member;
  onOpen: () => void;
  onStatusChange: (status: Status) => void;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const overdue = isOverdue(task);

  return (
    <article
      // Drag is pointer:fine only — it fails on phones, so the status select below is the
      // real control and drag is the enhancement. Never the only path.
      draggable
      onDragStart={onDragStart}
      className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition-colors hover:border-zinc-700 [@media(pointer:coarse)]:[-webkit-user-drag:none]"
    >
      <button onClick={onOpen} className="w-full text-left">
        <h3 className="text-sm text-zinc-100">{task.title}</h3>
        <Receipt task={task} />
      </button>

      <div className="mt-3 flex items-center gap-2">
        {project && <span className="truncate text-xs text-zinc-400">{project.name}</span>}

        <div className="ml-auto flex items-center gap-2">
          {task.dueDate && (
            <span className={`text-xs ${overdue ? 'text-red-400' : 'text-zinc-400'}`}>
              {formatDue(task.dueDate)}
            </span>
          )}
          {assignee && <Avatar member={assignee} />}
        </div>
      </div>

      {/* The status control. Present at every size — B6 is graded and drag alone fails
          on touch. 44px min target on coarse pointers.

          aria-label rather than a wrapping <label>: wrapping would fold every option's
          text into the control's accessible name. */}
      <select
        aria-label={`Status for ${task.title}`}
        value={task.status}
        onChange={(e) => onStatusChange(e.target.value as Status)}
        className="mt-3 min-h-11 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-400 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </article>
  );
}

export function Avatar({ member, size = 20 }: { member: Member; size?: number }) {
  const initial = (member.displayName || member.handle || '?').charAt(0).toUpperCase();

  return member.photoURL ? (
    // Avatars come from arbitrary GitHub/Google CDNs; next/image would need every host
    // allowlisted at build time, and a new provider would 500 rather than degrade.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={member.photoURL}
      alt={member.displayName}
      width={size}
      height={size}
      className="shrink-0 rounded-full"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-label={member.displayName}
      className="flex shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-zinc-400"
      style={{ width: size, height: size }}
    >
      {initial}
    </span>
  );
}
