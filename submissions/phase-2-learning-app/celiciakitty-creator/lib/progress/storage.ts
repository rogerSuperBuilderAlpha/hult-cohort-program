import type { CourseProgress, ModuleId, ModuleProgress } from "@/lib/course/types";
import { syncAchievementsWithProgress } from "@/lib/achievements";

export const PROGRESS_STORAGE_KEY = "lexlearn-course-progress-v1";
export const PROGRESS_CHANGE_EVENT = "lexlearn-progress-change";

/** Stable empty progress — same reference for SSR defaults and empty localStorage. */
export const DEFAULT_PROGRESS: CourseProgress = { modules: {} };

export function emptyProgress(): CourseProgress {
  return DEFAULT_PROGRESS;
}

export function parseProgress(raw: string | null): CourseProgress {
  if (!raw) return DEFAULT_PROGRESS;

  try {
    const parsed = JSON.parse(raw) as CourseProgress;
    if (!parsed || typeof parsed !== "object" || !parsed.modules) {
      return DEFAULT_PROGRESS;
    }
    return parsed;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function readProgressRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PROGRESS_STORAGE_KEY);
}

export function readProgress(): CourseProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  return parseProgress(readProgressRaw());
}

export function writeProgress(progress: CourseProgress): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  syncAchievementsWithProgress(progress);
  window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
}

export function updateModuleProgress(
  moduleId: ModuleId,
  patch: Partial<ModuleProgress>
): CourseProgress {
  const current = readProgress();
  const existing = current.modules[moduleId] ?? {
    lessonCompleted: false,
    quizCompleted: false,
  };

  const next: CourseProgress = {
    ...current,
    modules: {
      ...current.modules,
      [moduleId]: {
        ...existing,
        ...patch,
        lastVisited: new Date().toISOString(),
      },
    },
  };

  writeProgress(next);
  return next;
}

export function markLessonComplete(moduleId: ModuleId): CourseProgress {
  return updateModuleProgress(moduleId, { lessonCompleted: true });
}

export function recordQuizAttempt(score: number): CourseProgress {
  const current = readProgress();
  const next: CourseProgress = {
    ...current,
    totalCorrectAnswers: (current.totalCorrectAnswers ?? 0) + score,
  };
  writeProgress(next);
  return next;
}

export function markQuizComplete(
  moduleId: ModuleId,
  score: number,
  total: number
): CourseProgress {
  return updateModuleProgress(moduleId, {
    lessonCompleted: true,
    quizCompleted: true,
    quizScore: score,
    quizTotal: total,
  });
}
