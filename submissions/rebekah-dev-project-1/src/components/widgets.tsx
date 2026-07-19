import type { TaskPriority } from "@prisma/client";
import { daysUntil } from "@/lib/stats";

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

const priorityStyles: Record<TaskPriority, string> = {
  HIGH: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  MEDIUM: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  LOW: "border-slate-600 bg-slate-800 text-slate-300",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs ${priorityStyles[priority]}`}>
      {priority.toLowerCase()}
    </span>
  );
}

export function DueBadge({ dueDate, now }: { dueDate: Date | null; now: Date }) {
  if (!dueDate) return null;
  const days = daysUntil(dueDate, now);
  const label = days < 0 ? `${-days}d overdue` : days === 0 ? "due today" : `${days}d left`;
  const tone =
    days < 0
      ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
      : days <= 2
        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
        : "border-slate-600 bg-slate-800 text-slate-300";
  return <span className={`rounded-full border px-2 py-0.5 text-xs ${tone}`}>{label}</span>;
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
