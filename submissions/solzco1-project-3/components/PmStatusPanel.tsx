import type { PmSnapshot } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  done: "text-[var(--accent-2)]",
  "on-track": "text-[var(--accent)]",
  "at-risk": "text-yellow-400",
  blocked: "text-red-400",
};

export function PmStatusPanel({ snapshot }: { snapshot: PmSnapshot }) {
  return (
    <section className="glass-card rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold">Cohort project status</h2>
        <a
          href={snapshot.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-[var(--accent)] hover:underline"
        >
          {snapshot.sourceLabel} ↗
        </a>
      </div>
      <p className="mt-1 font-mono text-[10px] text-[var(--ink-muted)]">
        Synced {new Date(snapshot.syncedAt).toLocaleString()}
      </p>
      <ul className="mt-4 space-y-3">
        {snapshot.initiatives.map((init) => (
          <li
            key={init.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--glass-border)] pb-3 last:border-0"
          >
            <div>
              <p className="font-medium">{init.title}</p>
              <p className="font-mono text-xs text-[var(--ink-muted)]">
                @{init.ownerHandle} · {init.doneTasks} done · {init.openTasks} open
              </p>
            </div>
            <span
              className={`font-mono text-xs uppercase ${STATUS_COLORS[init.status] ?? ""}`}
            >
              {init.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
