import { loadBaseline, loadRetest } from "@/lib/baseline-storage";

export const EXERCISE_COMPLETE_EVENT = "score-course-exercise-complete";

const ACK_PREFIX = "score-course-exercise-ack-v1:";

function exerciseAckKey(moduleSlug: string) {
  return `${ACK_PREFIX}${moduleSlug}`;
}

export function isExerciseComplete(moduleSlug: string): boolean {
  if (typeof window === "undefined") return false;

  if (moduleSlug === "cold-open") {
    return Boolean(loadBaseline()?.result);
  }
  if (moduleSlug === "score-card") {
    return Boolean(loadRetest()?.result);
  }

  try {
    return window.localStorage.getItem(exerciseAckKey(moduleSlug)) === "1";
  } catch {
    return false;
  }
}

export function acknowledgeExercise(moduleSlug: string) {
  window.localStorage.setItem(exerciseAckKey(moduleSlug), "1");
  window.dispatchEvent(
    new CustomEvent(EXERCISE_COMPLETE_EVENT, { detail: { moduleSlug } }),
  );
}

export function notifyExerciseComplete(moduleSlug: string) {
  window.dispatchEvent(
    new CustomEvent(EXERCISE_COMPLETE_EVENT, { detail: { moduleSlug } }),
  );
}

/** Modules that use interactive scoring instead of a manual ack. */
export function usesScoredExercise(moduleSlug: string): boolean {
  return moduleSlug === "cold-open" || moduleSlug === "score-card";
}

/** Modules with an in-lesson quiz (completion via Submit answers). */
export function usesLessonQuiz(moduleSlug: string): boolean {
  return (
    moduleSlug === "why-ai-fails" ||
    moduleSlug === "situation" ||
    moduleSlug === "context" ||
    moduleSlug === "objective" ||
    moduleSlug === "role" ||
    moduleSlug === "expected-format" ||
    moduleSlug === "integration" ||
    moduleSlug === "capstone"
  );
}

/** Hide the manual “I’ve completed the exercise” ack when an interactive exercise gates completion. */
export function usesInteractiveExercise(moduleSlug: string): boolean {
  return usesScoredExercise(moduleSlug) || usesLessonQuiz(moduleSlug);
}
