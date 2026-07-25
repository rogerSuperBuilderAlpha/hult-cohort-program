/**
 * Pure helpers for the motivation widgets (streaks, progress, momentum).
 * All day math is done in UTC so results are stable across server regions.
 */

export function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Consecutive UTC days with at least one completion, counting back from
 * today. A streak survives if the most recent completion was today or
 * yesterday (so it doesn't reset to 0 before the day is over).
 */
export function computeStreak(completionDates: Date[], today: Date): number {
  if (completionDates.length === 0) return 0;
  const days = new Set(completionDates.map(utcDayKey));
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (!days.has(utcDayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(utcDayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(utcDayKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/** Percentage of done tasks, rounded to the nearest integer. 0 when empty. */
export function progressPercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

/**
 * Week-over-week momentum: completions in the last 7 days vs the 7 days
 * before that, plus a signed delta for the UI arrow.
 */
export function momentum(completionDates: Date[], now: Date): { thisWeek: number; lastWeek: number; delta: number } {
  const week = 7 * 24 * 60 * 60 * 1000;
  const t = now.getTime();
  let thisWeek = 0;
  let lastWeek = 0;
  for (const d of completionDates) {
    const age = t - d.getTime();
    if (age < 0) continue;
    if (age < week) thisWeek += 1;
    else if (age < 2 * week) lastWeek += 1;
  }
  return { thisWeek, lastWeek, delta: thisWeek - lastWeek };
}

/** Days until a due date in whole UTC days; negative means overdue. */
export function daysUntil(dueDate: Date, now: Date): number {
  const startOfDay = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((startOfDay(dueDate) - startOfDay(now)) / (24 * 60 * 60 * 1000));
}
