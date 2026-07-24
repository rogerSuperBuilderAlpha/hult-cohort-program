"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TaskLink } from "@/app/(app)/tasks/actions";

export function TasksView({ initial }: { initial: TaskLink[] }) {
  const [status, setStatus] = useState("all");
  const [assignee, setAssignee] = useState("all");

  const assignees = useMemo(() => {
    const set = new Set<string>();
    for (const t of initial) {
      if (t.assignee_email_snapshot) set.add(t.assignee_email_snapshot);
    }
    return Array.from(set).sort();
  }, [initial]);

  const statuses = useMemo(() => {
    const set = new Set(initial.map((t) => t.status_snapshot));
    return Array.from(set).sort();
  }, [initial]);

  const filtered = initial.filter((t) => {
    if (status !== "all" && t.status_snapshot !== status) return false;
    if (assignee === "unassigned" && t.assignee_email_snapshot) return false;
    if (
      assignee !== "all" &&
      assignee !== "unassigned" &&
      t.assignee_email_snapshot !== assignee
    ) {
      return false;
    }
    return true;
  });

  return (
    <section
      data-testid="tasks-page"
      className="mx-auto max-w-3xl rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 md:p-8"
    >
      <h1 className="text-2xl font-semibold text-[var(--color-dark)]">Tasks</h1>
      <p className="mt-2 text-sm text-[var(--color-secondary)]">
        Visible Forth TicketLinks — filter and open in Forth.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <label className="text-xs font-medium text-[var(--color-secondary)]">
          Status
          <select
            data-testid="tasks-filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-2 py-1.5 text-sm text-[var(--color-dark)]"
          >
            <option value="all">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-[var(--color-secondary)]">
          Assignee
          <select
            data-testid="tasks-filter-assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="mt-1 block rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-2 py-1.5 text-sm text-[var(--color-dark)]"
          >
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            {assignees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul data-testid="tasks-list" className="mt-6 space-y-2">
        {filtered.length === 0 ? (
          <li className="text-sm text-[var(--color-secondary)]">
            No TicketLinks match these filters.
          </li>
        ) : (
          filtered.map((t) => (
            <li key={t.id}>
              <a
                href={t.forth_url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="task-row"
                className="block rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] px-4 py-3 no-underline transition-colors hover:border-[var(--color-primary)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--color-dark)]">
                    {t.title_snapshot}
                  </p>
                  <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-dark)]">
                    {t.status_snapshot}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-secondary)]">
                  {t.channel_name ? `#${t.channel_name}` : "Channel"} ·{" "}
                  {t.assignee_email_snapshot || "Unassigned"}
                </p>
              </a>
            </li>
          ))
        )}
      </ul>

      <p className="mt-4 text-xs text-[var(--color-secondary)]">
        Tip: create tickets from messages with{" "}
        <Link href="/channels/general" className="text-[var(--color-primary)] underline">
          Create Forth ticket
        </Link>
        .
      </p>
    </section>
  );
}
