"use client";

import { useMemo, useState } from "react";
import type { PmSnapshot } from "@/lib/types";
import { PmStatusBoard } from "@/components/PmStatusBoard";

const FILTERS = ["all", "shipped", "on-track", "at-risk", "blocked"] as const;

export function InteractiveBoard({ snapshot }: { snapshot: PmSnapshot }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return {
      ...snapshot,
      projects: snapshot.projects.filter((p) => {
        const statusOk = filter === "all" || p.status === filter;
        const queryOk =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.ownerHandle.toLowerCase().includes(q);
        return statusOk && queryOk;
      }),
    };
  }, [snapshot, filter, query]);

  return (
    <div id="board" className="interactive-board">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="field flex-1">
          <label htmlFor="board-q">Filter board</label>
          <input
            id="board-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Project or owner"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`filter-chip ${filter === f ? "is-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-4 font-mono text-xs text-[var(--fog)]">
        Showing {filtered.projects.length} of {snapshot.projects.length}
      </p>
      {filtered.projects.length === 0 ? (
        <p className="text-[var(--fog)]">No projects match — clear a filter.</p>
      ) : (
        <PmStatusBoard snapshot={filtered} />
      )}
    </div>
  );
}
