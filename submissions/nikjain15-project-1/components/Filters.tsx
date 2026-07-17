'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { STATUS_LABELS, STATUSES, type Member, type Project, type Status, type Task } from '@/lib/types';

export type FilterState = {
  assignee: string;
  status: string;
  project: string;
};

/**
 * Read filters from the URL. The URL is the source of truth, not component state —
 * B8 wants them reflected there, and it means a filtered board is a link you can send.
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
    if (f.assignee !== 'all' && t.assigneeUid !== f.assignee) return false;
    if (f.status !== 'all' && t.status !== f.status) return false;
    if (f.project !== 'all' && t.projectId !== f.project) return false;
    return true;
  });
}

export function Filters({
  members,
  projects,
  showProject = true,
  showStatus = true,
  onNew,
}: {
  members: Member[];
  projects: Project[];
  showProject?: boolean;
  showStatus?: boolean;
  onNew: () => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const f = useFilters();

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

  return (
    // 2-up at 480, single row from 768. Filters must never push the board off screen.
    <div className="mb-4 grid grid-cols-2 gap-2 min-[768px]:flex min-[768px]:items-center">
      <FilterSelect
        label="assignee"
        value={f.assignee}
        onChange={(v) => set('assignee', v)}
        options={[
          { value: 'all', label: 'assignee: all' },
          ...members.map((m) => ({ value: m.uid, label: m.displayName })),
        ]}
      />

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

      <button
        onClick={onNew}
        className="ml-auto min-h-11 rounded border border-zinc-800 px-3 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100 max-[767px]:col-span-2"
      >
        + add
      </button>
    </div>
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
    <label className="contents">
      <span className="sr-only">Filter by {label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-filter={label}
        className="min-h-11 rounded border border-zinc-800 bg-zinc-950 px-2 text-xs text-zinc-400 focus:border-zinc-600 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
