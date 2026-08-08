import { getModuleProgress } from "@/lib/course/index";
import { moduleRegistry } from "@/lib/course/modules";
import type { CourseProgress, ModuleId } from "@/lib/course/types";

export {
  ACHIEVEMENTS,
  DEFAULT_ACHIEVEMENTS,
  type AchievementDefinition,
  type AchievementId,
  type AchievementsState,
} from "./types";

import type { AchievementId, AchievementsState } from "./types";
import { ACHIEVEMENTS, DEFAULT_ACHIEVEMENTS } from "./types";

export const ACHIEVEMENTS_STORAGE_KEY = "lexlearn-achievements-v1";
export const ACHIEVEMENTS_CHANGE_EVENT = "lexlearn-achievements-change";

function hasStartedModule(
  progress: CourseProgress,
  moduleId: ModuleId
): boolean {
  const moduleProgress = getModuleProgress(progress, moduleId);
  return Boolean(
    moduleProgress.lessonCompleted ||
      moduleProgress.quizCompleted ||
      moduleProgress.lastVisited
  );
}

function hasStartedCategory(
  progress: CourseProgress,
  category: "Civil Law" | "Criminal Law" | "Everyday Law"
): boolean {
  return moduleRegistry
    .filter((module) => module.category === category)
    .some((module) => hasStartedModule(progress, module.id));
}

export function evaluateAchievements(
  progress: CourseProgress,
  current: AchievementsState = DEFAULT_ACHIEVEMENTS
): AchievementsState {
  const unlocked = new Set(current.unlocked);

  const anyLessonComplete = moduleRegistry.some((module) =>
    getModuleProgress(progress, module.id).lessonCompleted
  );
  const anyQuizComplete = moduleRegistry.some((module) =>
    getModuleProgress(progress, module.id).quizCompleted
  );

  if (anyLessonComplete) unlocked.add("first-lesson");
  if (anyQuizComplete) unlocked.add("first-quiz");
  if (hasStartedCategory(progress, "Civil Law")) {
    unlocked.add("civil-law-started");
  }
  if (hasStartedCategory(progress, "Criminal Law")) {
    unlocked.add("criminal-law-started");
  }
  if ((progress.totalCorrectAnswers ?? 0) >= 5) {
    unlocked.add("five-correct-answers");
  }

  const nextUnlocked = ACHIEVEMENTS.map((a) => a.id).filter((id) =>
    unlocked.has(id)
  );

  return { unlocked: nextUnlocked };
}

export function readAchievements(): AchievementsState {
  if (typeof window === "undefined") return DEFAULT_ACHIEVEMENTS;

  try {
    const raw = window.localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return DEFAULT_ACHIEVEMENTS;
    const parsed = JSON.parse(raw) as AchievementsState;
    if (!parsed || !Array.isArray(parsed.unlocked)) {
      return DEFAULT_ACHIEVEMENTS;
    }
    return parsed;
  } catch {
    return DEFAULT_ACHIEVEMENTS;
  }
}

export function writeAchievements(state: AchievementsState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    ACHIEVEMENTS_STORAGE_KEY,
    JSON.stringify(state)
  );
  window.dispatchEvent(new Event(ACHIEVEMENTS_CHANGE_EVENT));
}

export function syncAchievementsWithProgress(
  progress: CourseProgress
): AchievementsState {
  const current = readAchievements();
  const next = evaluateAchievements(progress, current);

  const changed =
    next.unlocked.length !== current.unlocked.length ||
    next.unlocked.some((id, index) => id !== current.unlocked[index]);

  if (changed) {
    writeAchievements(next);
  }

  return next;
}

export function getAchievementDefinition(id: AchievementId) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

export function isAchievementUnlocked(
  state: AchievementsState,
  id: AchievementId
): boolean {
  return state.unlocked.includes(id);
}
