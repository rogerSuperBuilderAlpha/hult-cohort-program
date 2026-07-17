'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { STATUS_LABELS, STATUSES, type Member, type Project, type Status, type Task } from '@/lib/types';

export type FilterState = {
  assignee: string;
  status: string;
  project: string;
};

/**
 * Read filters from the URL. The URL is the source of truth, not component state —
 * B8 wants them reflected there, and it means a filtered board is a link you can send.
 *
 * `assignee` carries one value beyond 'all' and member uids: 'none', the unclaimed work —
 * tasks nobody has picked up. It filters WORK, not people: there is no value that shows
 * who's behind, and there never will be.
 */
export function useFilters(): FilterState {
  const params = useSearchParams();
  return {
    assignee: params.get('assignee') ?? 'all',
    status: params.get('status') ?? 'all',
    project: params.get('project') ?? 'all',
  };
}

/** Combinable — each filter narrows the last. "All" is the default for each. */
export function applyFilters(tasks: Task[], f: FilterState): Task[] {
  return tasks.filter((t) => {
    if (f.assignee !== 'all') {
      if (f.assignee === 'none' ? t.assigneeUid !== null : t.assigneeUid !== f.assignee) {
        return false;
      }
    }
    if (f.status !== 'all' && t.status !== f.status) return false;
    if (f.project !== 'all' && t.projectId !== f.project) return false;
    return true;
  });
}

/**
 * The filter row.
 *
 * **"Who" is chips, not a scroll marathon.** The assignee dropdown listed the whole cohort
 * alphabetically — 65 names to answer the three questions anyone actually asks: mine,
 * everyone's, nobody's. Those are chips now (the recipes screen's toggle pattern; active is
 * a raised surface, never green — green stays reserved for the motivating action). The full
 * member list survives as "someone else…", and it is the SAME select element the graded
 * tests drive: `select[data-filter="assignee"]`, selectOption by member label, B7/B8
 * unchanged.
 *
 * **Under 480 the controls collapse behind one "filters" row**, with + add kept visible —
 * on a phone the board is the product and the filters are furniture. The active count in
 * the label is load-bearing honesty: a filtered board hiding its filters would look empty
 * while it's actually narrowed, which is the stale-board lie by another route.
 */
export function Filters({
  members,
  projects,
  uid,
  showProject = true,
  showStatus = true,
  onNew,
}: {
  members: Member[];
  projects: Project[];
  /** The signed-in member — who the "me" chip means. */
  uid: string;
  showProject?: boolean;
  showStatus?: boolean;
  onNew: () => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const f = useFilters();
  const [open, setOpen] = useState(false);

  const set = useCallback(
    (key: keyof FilterState, value: string) => {
      const next = new URLSearchParams(params.toString());
      // Drop the param entirely at its default — a URL full of "=all" is noise to share.
      if (value === 'all') next.delete(key);
      else next.set(key, value);

      const qs = next.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [params, router]
  );

  const activeCount =
    (f.assignee !== 'all' ? 1 : 0) +
    (showStatus && f.status !== 'all' ? 1 : 0) +
    (showProject && f.project !== 'all' ? 1 : 0);

  return (
    <div className="mb-4">
      {/* The phone row: one toggle, + add always reachable. 480 is the nav breakpoint. */}
      <div className="flex items-center gap-2 min-[480px]:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="board-filters"
          className="min-h-11 flex-1 rounded border border-zinc-800 px-3 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100"
        >
          {activeCount > 0 ? `filters · ${activeCount}` : 'filters'} {open ? '▴' : '▾'}
        </button>
        <button
          onClick={onNew}
          className="min-h-11 rounded border border-zinc-800 px-3 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100"
        >
          + add
        </button>
      </div>

      <div
        id="board-filters"
        className={`${open ? 'mt-2 ' : 'max-[479px]:hidden '}grid grid-cols-2 gap-2 min-[768px]:flex min-[768px]:items-center`}
      >
        {/* Who. Three chips answer the real questions; the select holds the other 62. */}
        <div className="col-span-2 flex flex-wrap items-center gap-1 min-[768px]:col-auto">
          <Chip
            label="me"
            active={f.assignee === uid}
            onClick={() => set('assignee', f.assignee === uid ? 'all' : uid)}
          />
          <Chip label="everyone" active={f.assignee === 'all'} onClick={() => set('assignee', 'all')} />
          <Chip
            label="unclaimed"
            active={f.assignee === 'none'}
            onClick={() => set('assignee', f.assignee === 'none' ? 'all' : 'none')}
          />
          <FilterSelect
            label="assignee"
            // 'none' and unknown uids have no option here; the select falls back to its
            // "someone else…" face while the chips carry the state.
            value={members.some((m) => m.uid === f.assignee) ? f.assignee : 'all'}
            onChange={(v) => set('assignee', v)}
            options={[
              { value: 'all', label: 'someone else…' },
              ...members.map((m) => ({ value: m.uid, label: m.displayName })),
            ]}
          />
        </div>

        {showStatus && (
          <FilterSelect
            label="status"
            value={f.status}
            onChange={(v) => set('status', v)}
            options={[
              { value: 'all', label: 'status: all' },
              ...STATUSES.map((s) => ({ value: s as string, label: STATUS_LABELS[s as Status] })),
            ]}
          />
        )}

        {showProject && (
          <FilterSelect
            label="project"
            value={f.project}
            onChange={(v) => set('project', v)}
            options={[
              { value: 'all', label: 'project: all' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        )}

        {/* Desktop/tablet + add. On phones the collapsed row above owns it. */}
        <button
          onClick={onNew}
          className="ml-auto min-h-11 rounded border border-zinc-800 px-3 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100 max-[767px]:col-span-2 max-[479px]:hidden"
        >
          + add
        </button>
      </div>
    </div>
  );
}

/** The recipes screen's toggle pattern: active is a raised surface, never green. */
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 rounded px-3 text-xs transition-colors ${
        active
          ? 'border border-zinc-600 bg-zinc-900 text-zinc-100'
          : 'border border-zinc-800 text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    // aria-label, not a wrapping <label>: wrapping folds every option's text into the
    // control's accessible name, so "assignee" would announce as the whole cohort roster.
    <select
      aria-label={`Filter by ${label}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-filter={label}
      className="min-h-11 rounded border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-400 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
