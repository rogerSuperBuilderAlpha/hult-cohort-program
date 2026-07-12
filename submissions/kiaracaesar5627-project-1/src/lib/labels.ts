import type { TaskStatus } from "./types";

export function statusLabel(status: TaskStatus) {
  switch (status) {
    case "TODO":
      return "To do";
    case "IN_PROGRESS":
      return "In progress";
    case "DONE":
      return "Done";
  }
}

export function urgency(dueDate: Date | string | null | undefined) {
  if (!dueDate) return null;
  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const diff = date.getTime() - now.getTime();
  if (diff < 0) return { kind: "overdue" as const, label: "Overdue" };
  if (diff < 2 * dayMs) return { kind: "soon" as const, label: "Due soon" };
  return { kind: "ok" as const, label: date.toLocaleDateString() };
}

export function projectProgress(tasks: { status: TaskStatus }[]) {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}
