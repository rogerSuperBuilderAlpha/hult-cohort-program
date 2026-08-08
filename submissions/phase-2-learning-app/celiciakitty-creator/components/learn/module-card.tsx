"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ClipboardCheck,
  Lock,
  PlayCircle,
} from "lucide-react";

import { CategoryBadge } from "@/components/learn/category-badge";
import {
  getModuleDisplayStatus,
  getModuleMeta,
  isModuleUnlocked,
} from "@/lib/course/index";
import type { ModuleDisplayStatus, ModuleId } from "@/lib/course/types";
import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

type ModuleCardProps = {
  moduleId: ModuleId;
};

export function ModuleCard({ moduleId }: ModuleCardProps) {
  const { progress, hydrated } = useProgress();
  const meta = getModuleMeta(moduleId);

  if (!meta) return null;

  const status: ModuleDisplayStatus = hydrated
    ? getModuleDisplayStatus(progress, moduleId)
    : moduleId === "1"
      ? "available"
      : "locked";

  const unlocked = hydrated
    ? isModuleUnlocked(progress, moduleId)
    : moduleId === "1";

  const lessonHref = `/learn/${moduleId}`;
  const quizHref = `/quiz/${moduleId}`;

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white p-5 shadow-sm transition-shadow",
        status === "locked"
          ? "border-lex-navy/8 opacity-80"
          : "border-lex-navy/10 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-lex-gold">
              Module {moduleId}
            </p>
            <CategoryBadge category={meta.category} />
          </div>
          <h2 className="mt-1 font-serif text-xl font-semibold text-lex-navy">
            {meta.title}
          </h2>
          <p className="mt-2 text-sm text-lex-navy/65">{meta.description}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {!meta.hasContent ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-lex-pale px-3 py-2 text-sm text-lex-navy/60">
            <Lock className="size-4" aria-hidden />
            Content coming soon
          </span>
        ) : !unlocked ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-lex-pale px-3 py-2 text-sm text-lex-navy/60">
            <Lock className="size-4" aria-hidden />
            Complete the previous module quiz to unlock
          </span>
        ) : (
          <>
            <Link
              href={lessonHref}
              className="inline-flex items-center gap-1.5 rounded-lg bg-lex-navy px-4 py-2 text-sm font-medium text-white hover:bg-lex-navy/90"
            >
              <PlayCircle className="size-4" aria-hidden />
              {status === "completed" || status === "in-progress"
                ? "Review lesson"
                : "Start lesson"}
            </Link>
            <Link
              href={quizHref}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium",
                status === "completed"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-lex-navy/15 bg-white text-lex-navy hover:bg-lex-pale"
              )}
            >
              <ClipboardCheck className="size-4" aria-hidden />
              {status === "completed" ? "Quiz completed" : "Take quiz"}
            </Link>
          </>
        )}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: ModuleDisplayStatus }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
        <CheckCircle2 className="size-3.5" aria-hidden />
        Completed
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="rounded-full bg-lex-navy/10 px-2.5 py-1 text-xs font-medium text-lex-navy">
        In progress
      </span>
    );
  }
  if (status === "available") {
    return (
      <span className="rounded-full bg-lex-gold/15 px-2.5 py-1 text-xs font-medium text-lex-navy">
        Available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-lex-pale px-2.5 py-1 text-xs font-medium text-lex-navy/50 ring-1 ring-lex-navy/10">
      <Lock className="size-3.5" aria-hidden />
      Locked
    </span>
  );
}
