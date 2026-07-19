"use client";

import { Task, TaskStatus, STATUS_ORDER, STATUS_LABELS } from "@/lib/types";

const priorityColor: Record<string, string> = {
  High: "var(--priority-high)",
  Medium: "var(--priority-medium)",
  Low: "var(--priority-low)",
};

function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate + "T00:00:00") < today;
}

export default function TaskCard({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
}) {
  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div
      className="p-4 rounded-lg border animate-slide-in flex flex-col gap-2"
      style={{ background: "var(--bg)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
          style={{
            color: priorityColor[task.priority],
            background: `${priorityColor[task.priority]}22`,
          }}
        >
          {task.priority}
        </span>
        <button
          onClick={onDelete}
          className="text-xs shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          Delete
        </button>
      </div>

      <p className="font-medium text-sm">{task.name}</p>
      {task.description && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        <span>{task.assignee_name ? `@ ${task.assignee_name}` : "Unassigned"}</span>
        {task.due_date && (
          <span style={{ color: overdue ? "var(--danger)" : "var(--text-muted)" }}>
            Due {new Date(task.due_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      <div className="flex gap-1.5 mt-1">
        {currentIndex > 0 && (
          <button
            onClick={() => onStatusChange(STATUS_ORDER[currentIndex - 1])}
            className="flex-1 py-1.5 rounded-md text-xs font-semibold border"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            ← {STATUS_LABELS[STATUS_ORDER[currentIndex - 1]]}
          </button>
        )}
        {currentIndex < STATUS_ORDER.length - 1 && (
          <button
            onClick={() => onStatusChange(STATUS_ORDER[currentIndex + 1])}
            className="flex-1 py-1.5 rounded-md text-xs font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {STATUS_LABELS[STATUS_ORDER[currentIndex + 1]]} →
          </button>
        )}
      </div>
    </div>
  );
}
