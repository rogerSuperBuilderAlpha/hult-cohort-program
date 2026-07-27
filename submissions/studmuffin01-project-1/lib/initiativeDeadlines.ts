/**
 * Executive Summary deadline derived from Initiative Summary task due dates.
 */

import type { InitiativeTasks } from "@/lib/initiativeTasks";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Parse a task or ISO due date to local midnight. */
export function parseDueDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (ISO_DATE_PATTERN.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }

  const date = new Date(parsed);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Normalize any parseable due date to YYYY-MM-DD. */
export function toIsoDateString(value: string): string | null {
  const date = parseDueDate(value);
  if (!date) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Latest (furthest) due date among tasks, as YYYY-MM-DD, or null if none set. */
export function getLatestTaskDueDate(tasks: InitiativeTasks | undefined): string | null {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  let latest: Date | null = null;
  let latestIso: string | null = null;

  for (const task of tasks) {
    const iso = toIsoDateString(task.dateDue);
    if (!iso) {
      continue;
    }

    const date = parseDueDate(iso);
    if (!date) {
      continue;
    }

    if (!latest || date.getTime() > latest.getTime()) {
      latest = date;
      latestIso = iso;
    }
  }

  return latestIso;
}

export function formatDeadlineDisplay(isoDate: string | null): string {
  if (!isoDate) {
    return "—";
  }

  const date = parseDueDate(isoDate);
  if (!date) {
    return isoDate;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Short date for compact Executive Summary cells (e.g. "Jul 25, 2026"). */
export function formatDeadlineCompact(isoDate: string | null): string {
  if (!isoDate) {
    return "—";
  }

  const date = parseDueDate(isoDate);
  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDaysToDeadline(isoDate: string | null): number | null {
  if (!isoDate) {
    return null;
  }

  const date = parseDueDate(isoDate);
  if (!date) {
    return null;
  }

  const today = startOfToday();
  const millisecondsPerDay = 86_400_000;
  return Math.round((date.getTime() - today.getTime()) / millisecondsPerDay);
}

export function formatDaysToDeadline(isoDate: string | null): string {
  const days = getDaysToDeadline(isoDate);
  if (days === null) {
    return "—";
  }

  if (days === 0) {
    return "Today";
  }

  if (days > 0) {
    return `+${days}d`;
  }

  return `${days}d`;
}

export function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/** Stored value for legacy custom_initiatives.deadline column when empty. */
export function storedInitiativeDeadline(deadline: string): string {
  const iso = toIsoDateString(deadline);
  return iso ?? "TBD";
}
