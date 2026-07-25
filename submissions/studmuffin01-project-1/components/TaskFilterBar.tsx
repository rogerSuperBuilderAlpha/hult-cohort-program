"use client";

import { memo } from "react";
import {
  EMPTY_TASK_FILTERS,
  hasActiveTaskFilters,
  TASK_FILTER_STATUS_OPTIONS,
  type TaskFilters,
} from "@/lib/taskFilters";
import type { Initiative } from "@/lib/initiatives";

const selectClassName =
  "rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-bg dark:text-surface-primary";

const clearButtonClassName =
  "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-surface-border dark:bg-surface-card dark:text-surface-secondary dark:hover:bg-surface-bg";

interface TaskFilterBarProps {
  filters: TaskFilters;
  initiatives: Initiative[];
  assigneeOptions: string[];
  onChange: (filters: TaskFilters) => void;
}

function TaskFilterBar({ filters, initiatives, assigneeOptions, onChange }: TaskFilterBarProps) {
  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div
      aria-label="Task filters"
      className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-surface-border dark:bg-surface-bg"
    >
      <div className="space-y-1">
        <label htmlFor="task-filter-status" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-surface-secondary">
          Status
        </label>
        <select
          id="task-filter-status"
          value={filters.status}
          onChange={(event) => updateFilter("status", event.target.value as TaskFilters["status"])}
          className={selectClassName}
        >
          <option value="">All statuses</option>
          {TASK_FILTER_STATUS_OPTIONS.filter(Boolean).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="task-filter-assignee" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-surface-secondary">
          Assignee
        </label>
        <select
          id="task-filter-assignee"
          value={filters.assignee}
          onChange={(event) => updateFilter("assignee", event.target.value)}
          className={selectClassName}
        >
          <option value="">All assignees</option>
          {assigneeOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="task-filter-initiative" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-surface-secondary">
          Project
        </label>
        <select
          id="task-filter-initiative"
          value={filters.initiativeSlug}
          onChange={(event) => updateFilter("initiativeSlug", event.target.value)}
          className={selectClassName}
        >
          <option value="">All projects</option>
          {initiatives.map((initiative) => (
            <option key={initiative.slug} value={initiative.slug}>
              {initiative.title}
            </option>
          ))}
        </select>
      </div>

      {hasActiveTaskFilters(filters) && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_TASK_FILTERS)}
          className={clearButtonClassName}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default memo(TaskFilterBar);
