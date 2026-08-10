import { module1Lesson, module1Quiz } from "@/lib/course/content/module-1";
import { module2Lesson, module2Quiz } from "@/lib/course/content/module-2";
import { module3Lesson, module3Quiz } from "@/lib/course/content/module-3";
import { module4Lesson, module4Quiz } from "@/lib/course/content/module-4";
import { module5Lesson, module5Quiz } from "@/lib/course/content/module-5";
import { getLevelProgress } from "@/lib/progress/levels";
import {
  COURSE_TITLE,
  getModuleMeta,
  isValidModuleId,
  MODULE_ORDER,
} from "@/lib/course/modules";
import type {
  CourseProgress,
  LessonContent,
  ModuleDisplayStatus,
  ModuleId,
  ModuleProgress,
  QuizContent,
} from "@/lib/course/types";

const lessons: Partial<Record<ModuleId, LessonContent>> = {
  "1": module1Lesson,
  "2": module2Lesson,
  "3": module3Lesson,
  "4": module4Lesson,
  "5": module5Lesson,
};

const quizzes: Partial<Record<ModuleId, QuizContent>> = {
  "1": module1Quiz,
  "2": module2Quiz,
  "3": module3Quiz,
  "4": module4Quiz,
  "5": module5Quiz,
};

export {
  moduleRegistry,
  MODULE_ORDER,
  COURSE_TITLE,
  COURSE_SUBTITLE,
  SUBJECT_CATEGORIES,
  getModuleMeta,
  isValidModuleId,
} from "@/lib/course/modules";

export function getLesson(moduleId: string): LessonContent | undefined {
  if (!isValidModuleId(moduleId)) return undefined;
  return lessons[moduleId];
}

export function getQuiz(moduleId: string): QuizContent | undefined {
  if (!isValidModuleId(moduleId)) return undefined;
  return quizzes[moduleId];
}

export function getModuleProgress(
  progress: CourseProgress,
  moduleId: ModuleId
): ModuleProgress {
  return (
    progress.modules[moduleId] ?? {
      lessonCompleted: false,
      quizCompleted: false,
    }
  );
}

export function isModuleUnlocked(
  progress: CourseProgress,
  moduleId: ModuleId
): boolean {
  const meta = getModuleMeta(moduleId);
  if (!meta) return false;
  if (!meta.hasContent) return false;

  const index = MODULE_ORDER.indexOf(moduleId);
  if (index === 0) return true;

  const previousId = MODULE_ORDER[index - 1];
  if (!previousId) return false;
  return getModuleProgress(progress, previousId).quizCompleted;
}

export function getModuleDisplayStatus(
  progress: CourseProgress,
  moduleId: ModuleId
): ModuleDisplayStatus {
  const meta = getModuleMeta(moduleId);
  if (!meta?.hasContent) return "locked";
  if (!isModuleUnlocked(progress, moduleId)) return "locked";

  const moduleProgress = getModuleProgress(progress, moduleId);
  if (moduleProgress.quizCompleted) return "completed";
  if (moduleProgress.lessonCompleted) return "in-progress";
  return "available";
}

export function getCourseSummary(progress: CourseProgress) {
  const total = MODULE_ORDER.length;
  const completed = MODULE_ORDER.filter(
    (id) => getModuleDisplayStatus(progress, id) === "completed"
  ).length;

  const percent = Math.round((completed / total) * 100);
  const remainingModules = total - completed;
  const timeRemaining =
    remainingModules === 0
      ? "Course complete"
      : `~${remainingModules * 12} min remaining`;

  const currentModule =
    MODULE_ORDER.find((id) => {
      const status = getModuleDisplayStatus(progress, id);
      return status === "available" || status === "in-progress";
    }) ?? MODULE_ORDER[0];

  return {
    percent,
    completed,
    total,
    timeRemaining,
    currentModuleId: currentModule,
    currentModuleTitle: getModuleMeta(currentModule)?.title ?? COURSE_TITLE,
    level: getLevelProgress(completed, total),
  };
}

export function getContinueHref(progress: CourseProgress): string {
  const summary = getCourseSummary(progress);
  const status = getModuleDisplayStatus(progress, summary.currentModuleId);

  if (status === "in-progress" || status === "available") {
    const moduleProgress = getModuleProgress(progress, summary.currentModuleId);
    if (moduleProgress.lessonCompleted) {
      return `/quiz/${summary.currentModuleId}`;
    }
    return `/learn/${summary.currentModuleId}`;
  }

  if (status === "completed") {
    return `/progress`;
  }

  return `/learn/${summary.currentModuleId}`;
}
