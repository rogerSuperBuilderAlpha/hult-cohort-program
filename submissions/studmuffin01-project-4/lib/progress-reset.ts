import { modules } from "@/content/course";
import {
  clearBaseline,
  clearRetest,
  loadBaseline,
} from "@/lib/baseline-storage";
import {
  EXERCISE_COMPLETE_EVENT,
  usesLessonQuiz,
} from "@/lib/exercise-progress";
import {
  MODULE_COMPLETE_EVENT,
  getCompletedModules,
  replaceCompletedModules,
} from "@/lib/module-completion";

export const PROGRESS_RESET_EVENT = "score-course-progress-reset";

const ACK_PREFIX = "score-course-exercise-ack-v1:";
const LESSON_ANSWERS_PREFIX = "score-course-lesson-answers-v1:";
const CAPSTONE_ASSEMBLE_KEY = "score-course-capstone-assemble-v1";
const BASELINE_MODULE = "cold-open";
const RETEST_MODULE = "score-card";

function dispatchProgressReset(detail?: { scope?: string }) {
  window.dispatchEvent(new CustomEvent(PROGRESS_RESET_EVENT, { detail }));
  window.dispatchEvent(
    new CustomEvent(MODULE_COMPLETE_EVENT, { detail: { moduleSlug: "*" } }),
  );
  window.dispatchEvent(
    new CustomEvent(EXERCISE_COMPLETE_EVENT, { detail: { moduleSlug: "*" } }),
  );
}

/** True when every course module is marked complete on this device. */
export function isCourseFullyComplete(): boolean {
  if (typeof window === "undefined") return false;
  const done = new Set(getCompletedModules());
  return modules.every((mod) => done.has(mod.slug));
}

function clearPracticeStorage(options: { includeBaselineModule: boolean }) {
  for (const mod of modules) {
    if (!options.includeBaselineModule && mod.slug === BASELINE_MODULE) {
      continue;
    }
    try {
      window.localStorage.removeItem(`${ACK_PREFIX}${mod.slug}`);
    } catch {
      /* ignore */
    }
    if (usesLessonQuiz(mod.slug)) {
      try {
        window.localStorage.removeItem(`${LESSON_ANSWERS_PREFIX}${mod.slug}`);
      } catch {
        /* ignore */
      }
    }
  }

  try {
    window.localStorage.removeItem(CAPSTONE_ASSEMBLE_KEY);
  } catch {
    /* ignore */
  }
  clearRetest();
}

/**
 * Practice reset after completion.
 * Clears practice progress and the Module 10 retest.
 * Keeps Module 01 baseline (and its completion checkmark) locked.
 */
export function resetCourseProgressPreservingBaseline(): {
  ok: boolean;
  reason?: string;
} {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }
  if (!isCourseFullyComplete()) {
    return { ok: false, reason: "incomplete" };
  }
  if (!loadBaseline()?.result) {
    return { ok: false, reason: "no-baseline" };
  }

  replaceCompletedModules([BASELINE_MODULE]);
  clearPracticeStorage({ includeBaselineModule: false });

  dispatchProgressReset({ scope: "course" });
  return { ok: true };
}

/**
 * Hard reset after completion — wipes Module 01 baseline too.
 * Learner starts Module 01 from a blank prompt again.
 */
export function resetCourseProgressFull(): {
  ok: boolean;
  reason?: string;
} {
  if (typeof window === "undefined") {
    return { ok: false, reason: "unavailable" };
  }
  if (!isCourseFullyComplete()) {
    return { ok: false, reason: "incomplete" };
  }

  replaceCompletedModules([]);
  clearPracticeStorage({ includeBaselineModule: true });
  clearBaseline();

  dispatchProgressReset({ scope: "full" });
  return { ok: true };
}

/** Practice retry for Module 10 only — does not touch Module 01 baseline. */
export function retryModule10Retest(): void {
  if (typeof window === "undefined") return;
  clearRetest();
  const kept = getCompletedModules().filter((slug) => slug !== RETEST_MODULE);
  replaceCompletedModules(kept);
  try {
    window.localStorage.removeItem(`${ACK_PREFIX}${RETEST_MODULE}`);
  } catch {
    /* ignore */
  }
  dispatchProgressReset({ scope: "retest" });
}
