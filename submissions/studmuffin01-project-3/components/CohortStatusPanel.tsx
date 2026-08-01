import { pmSnapshot } from "@/lib/pm-snapshot";

const statusTone: Record<string, string> = {
  "on-track": "text-[var(--ok)]",
  "at-risk": "text-[var(--warn)]",
  done: "text-[var(--ink-muted)]",
};

export function CohortStatusPanel({ compact = false }: { compact?: boolean }) {
  const synced = new Date(pmSnapshot.syncedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section
      className={
        compact
          ? "border border-[var(--line)] bg-[var(--bg-elevated)] p-4"
          : "border border-[var(--line)] bg-[var(--bg-elevated)] p-5 sm:p-6"
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold tracking-tight">
          Cohort project status
        </h2>
        <a
          href={pmSnapshot.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--signal)] hover:underline"
        >
          {pmSnapshot.sourceLabel}
        </a>
      </div>
      <p className="mt-1 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
        Read-only snapshot · synced {synced}
      </p>
      <ul className="mt-4 divide-y divide-[var(--line)]">
        {pmSnapshot.initiatives.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--ink)]">{item.title}</p>
              <p className="mt-0.5 font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--ink-faint)]">
                @{item.ownerHandle} · {item.doneTasks} done · {item.openTasks}{" "}
                open
              </p>
            </div>
            <span
              className={`font-[family-name:var(--font-jetbrains)] text-[10px] font-medium uppercase tracking-[0.12em] ${statusTone[item.status]}`}
            >
              {item.status.replace("-", " ")}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
