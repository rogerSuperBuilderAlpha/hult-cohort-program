"use client";

import SidebarPageFrame, {
  SidebarPanelCompact,
  SidebarSectionTitle,
  sidebarHintClassName,
} from "@/components/sidebar/SidebarPageFrame";
import { useSidebarData } from "@/hooks/SidebarDataProvider";

function LeaderboardList({
  scores,
  emptyMessage,
  valueLabel,
}: {
  scores: { name: string; count: number }[];
  emptyMessage: string;
  valueLabel: string;
}) {
  if (scores.length === 0) {
    return <p className="text-xs text-slate-600 dark:text-surface-secondary">{emptyMessage}</p>;
  }

  return (
    <ol className="grid gap-1.5 sm:grid-cols-2">
      {scores.map((entry, index) => (
        <li
          key={entry.name}
          className="flex items-center justify-between rounded-md border border-slate-200 px-2 py-1.5 dark:border-surface-border"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                index === 0
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                  : "bg-slate-100 text-slate-700 dark:bg-surface-bg dark:text-surface-secondary"
              }`}
            >
              {index + 1}
            </span>
            <span className="truncate text-xs font-medium text-slate-900 dark:text-surface-primary">
              {entry.name}
            </span>
          </div>
          <span className="ml-2 shrink-0 text-[11px] tabular-nums text-slate-600 dark:text-surface-secondary">
            {entry.count} {valueLabel}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function TopTenPerformersPage() {
  return (
    <SidebarPageFrame
      title="Top Performers"
      subtitle="Team Members With the Most Completed Tasks"
    >
      <TopPerformersContent />
    </SidebarPageFrame>
  );
}

function TopPerformersContent() {
  const { performerScores } = useSidebarData();

  return (
      <SidebarPanelCompact>
        <p className={`mb-2 ${sidebarHintClassName}`}>
          Rankings are based on tasks marked <strong>Done</strong> with an assignee. Add team
          members and assign tasks on the dashboard to populate this board.
        </p>
        <SidebarSectionTitle>Leaderboard</SidebarSectionTitle>
        <div className="mt-2">
          <LeaderboardList
            scores={performerScores}
            emptyMessage="No completed assignee tasks yet. Finish tasks and set assignees to appear here."
            valueLabel="done"
          />
        </div>
      </SidebarPanelCompact>
  );
}
