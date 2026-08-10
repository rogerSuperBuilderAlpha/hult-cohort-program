"use client";

import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";

import { AchievementsSection } from "@/components/learn/achievements-section";
import { CategoryBadge } from "@/components/learn/category-badge";
import { LearningLevelCard } from "@/components/learn/learning-level-card";
import {
  getCourseSummary,
  getModuleDisplayStatus,
  getModuleMeta,
  getModuleProgress,
  MODULE_ORDER,
} from "@/lib/course/index";
import { COURSE_TITLE } from "@/lib/course/modules";
import type { ModuleId } from "@/lib/course/types";
import { getLevelProgress } from "@/lib/progress/levels";
import { useProgress } from "@/hooks/use-progress";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ProgressPageContent() {
  const { progress, hydrated } = useProgress();

  const summary = hydrated
    ? getCourseSummary(progress)
    : {
        percent: 0,
        completed: 0,
        total: 5,
        timeRemaining: "~60 min remaining",
        currentModuleId: "1" as ModuleId,
        currentModuleTitle: "Contracts in Everyday Life",
        level: getLevelProgress(0, 5),
      };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lex-gold">
          Your learning journey
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-lex-navy sm:text-4xl">
          Progress
        </h1>
        <p className="mt-3 text-base text-lex-navy/75">
          Track your level, achievements and module completion across{" "}
          {COURSE_TITLE}.
        </p>
      </header>

      <LearningLevelCard levelProgress={summary.level} className="mb-8" />

      <section
        className="mb-8 rounded-2xl border border-lex-navy/10 bg-white p-6 shadow-sm"
        aria-labelledby="overall-progress"
      >
        <h2
          id="overall-progress"
          className="font-serif text-xl font-semibold text-lex-navy"
        >
          Module completion
        </h2>
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-lex-navy/70">Modules completed</span>
            <span className="font-medium tabular-nums text-lex-navy">
              {summary.completed} / {summary.total}
            </span>
          </div>
          <Progress value={summary.percent} className="gap-0">
            <ProgressTrack className="h-3 bg-lex-pale">
              <ProgressIndicator className="rounded-full bg-lex-navy" />
            </ProgressTrack>
          </Progress>
          <p className="mt-3 text-sm text-lex-navy/65">{summary.timeRemaining}</p>
        </div>
      </section>

      <div className="mb-8">
        <AchievementsSection />
      </div>

      <section aria-labelledby="module-breakdown">
        <h2
          id="module-breakdown"
          className="mb-4 font-serif text-xl font-semibold text-lex-navy"
        >
          Module breakdown
        </h2>
        <ul className="space-y-3" role="list">
          {MODULE_ORDER.map((moduleId) => {
            const status = hydrated
              ? getModuleDisplayStatus(progress, moduleId)
              : moduleId === "1"
                ? "available"
                : "locked";
            const moduleProgress = hydrated
              ? getModuleProgress(progress, moduleId)
              : { lessonCompleted: false, quizCompleted: false };

            return (
              <li
                key={moduleId}
                className="rounded-xl border border-lex-navy/10 bg-white px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <ModuleStatusIcon status={status} />
                  <div className="min-w-0 flex-1">
                    {getModuleMeta(moduleId)?.category && (
                      <CategoryBadge
                        category={getModuleMeta(moduleId)!.category}
                        className="mb-2"
                      />
                    )}
                    <p className="font-medium text-lex-navy">
                      Module {moduleId}:{" "}
                      {getModuleMeta(moduleId)?.title ?? "Module"}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-lex-navy/65">
                      <li>
                        Lesson:{" "}
                        {moduleProgress.lessonCompleted ? "Completed" : "Not completed"}
                      </li>
                      <li>
                        Quiz:{" "}
                        {moduleProgress.quizCompleted
                          ? `Completed (${moduleProgress.quizScore}/${moduleProgress.quizTotal})`
                          : "Not completed"}
                      </li>
                    </ul>
                    {status !== "locked" && (
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/learn/${moduleId}`}
                          className="text-sm font-medium text-lex-navy underline-offset-4 hover:underline"
                        >
                          Lesson
                        </Link>
                        <Link
                          href={`/quiz/${moduleId}`}
                          className="text-sm font-medium text-lex-navy underline-offset-4 hover:underline"
                        >
                          Quiz
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function ModuleStatusIcon({
  status,
}: {
  status: ReturnType<typeof getModuleDisplayStatus>;
}) {
  if (status === "completed") {
    return (
      <CheckCircle2
        className="mt-0.5 size-5 shrink-0 text-emerald-600"
        aria-hidden
      />
    );
  }
  if (status === "locked") {
    return (
      <Lock className="mt-0.5 size-5 shrink-0 text-lex-navy/35" aria-hidden />
    );
  }
  return (
    <Circle
      className={cn(
        "mt-0.5 size-5 shrink-0",
        status === "in-progress" ? "text-lex-gold" : "text-lex-navy/40"
      )}
      aria-hidden
    />
  );
}
