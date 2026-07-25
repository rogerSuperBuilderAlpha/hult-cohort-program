// Client-safe formatting helpers.

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

export function projectProgress(
  tasks: { status_id: string | null }[],
  doneStatusIds: Set<string>,
): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status_id && doneStatusIds.has(t.status_id)).length;
  return Math.round((done / tasks.length) * 100);
}

/** Pick readable foreground (black/white) for a given hex background. */
export function readableText(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "#ffffff";
  const int = parseInt(m[1], 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}
