"use client";

import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import type { LevelProgress } from "@/lib/progress/levels";
import { cn } from "@/lib/utils";

type LearningLevelCardProps = {
  levelProgress: LevelProgress;
  className?: string;
  compact?: boolean;
};

export function LearningLevelCard({
  levelProgress,
  className,
  compact = false,
}: LearningLevelCardProps) {
  const { current, next, completedModules, totalModules, progressToNext } =
    levelProgress;

  return (
    <div
      className={cn(
        "rounded-2xl border border-lex-navy/10 bg-gradient-to-br from-lex-pale/60 to-white p-5 shadow-sm",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-lex-gold">
        Your learning level
      </p>
      <h2 className="mt-2 font-serif text-2xl font-semibold text-lex-navy">
        {current.title}
      </h2>
      {!compact && (
        <p className="mt-2 text-sm leading-relaxed text-lex-navy/70">
          {current.description}
        </p>
      )}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-lex-navy/70">
            {next
              ? `Progress to ${next.title}`
              : "Highest level reached"}
          </span>
          <span className="font-medium tabular-nums text-lex-navy">
            {completedModules} / {totalModules} modules
          </span>
        </div>
        <Progress value={progressToNext} className="gap-0">
          <ProgressTrack className="h-2.5 bg-lex-pale">
            <ProgressIndicator className="rounded-full bg-lex-gold" />
          </ProgressTrack>
        </Progress>
        {next && (
          <p className="mt-2 text-xs text-lex-navy/55">
            Complete {next.minCompletedModules - completedModules} more module
            {next.minCompletedModules - completedModules === 1 ? "" : "s"} to
            reach {next.title}.
          </p>
        )}
      </div>
    </div>
  );
}
