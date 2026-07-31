import Link from "next/link";
import type { CohortActivity } from "@/lib/activity";

export function CohortActivityFeed({
  items,
  compact = false,
}: {
  items: CohortActivity[];
  compact?: boolean;
}) {
  return (
    <ul
      className={`border border-[var(--line)] bg-[var(--bg-elevated)] ${
        compact ? "" : ""
      }`}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-1 border-b border-[var(--line)] px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
        >
          {item.href ? (
            <Link
              href={item.href}
              className="text-sm text-[var(--ink)] transition hover:text-[var(--signal)]"
            >
              {item.text}
            </Link>
          ) : (
            <span className="text-sm text-[var(--ink)]">{item.text}</span>
          )}
          <span className="shrink-0 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
            {item.when}
          </span>
        </li>
      ))}
    </ul>
  );
}
