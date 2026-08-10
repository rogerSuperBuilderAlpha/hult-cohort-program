"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { LudwittAuthGate } from "@/components/learn/ludwitt-auth-gate";
import { LessonView } from "@/components/learn/lesson-view";
import { isModuleUnlocked } from "@/lib/course/index";
import type { LessonContent, ModuleId } from "@/lib/course/types";
import { useProgress } from "@/hooks/use-progress";

type ModuleLessonGateProps = {
  lesson: LessonContent;
};

export function ModuleLessonGate({ lesson }: ModuleLessonGateProps) {
  const { progress, hydrated } = useProgress();
  const moduleId = lesson.moduleId as ModuleId;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-lex-navy/60">
        Loading module…
      </div>
    );
  }

  if (!isModuleUnlocked(progress, moduleId)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Lock className="mx-auto size-10 text-lex-navy/35" aria-hidden />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-lex-navy">
          Module locked
        </h1>
        <p className="mt-2 text-lex-navy/70">
          Complete the quiz for the previous module to unlock this lesson.
        </p>
        <Link
          href="/learn"
          className="mt-6 inline-flex rounded-lg bg-lex-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-lex-navy/90"
        >
          Back to modules
        </Link>
      </div>
    );
  }

  return (
    <LudwittAuthGate returnPath={`/learn/${moduleId}`}>
      <LessonView lesson={lesson} />
    </LudwittAuthGate>
  );
}
