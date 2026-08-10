"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { LudwittAuthGate } from "@/components/learn/ludwitt-auth-gate";
import { QuizView } from "@/components/learn/quiz-view";
import { isModuleUnlocked } from "@/lib/course/index";
import type { ModuleId, QuizContent } from "@/lib/course/types";
import { useProgress } from "@/hooks/use-progress";

type ModuleQuizGateProps = {
  quiz: QuizContent;
};

export function ModuleQuizGate({ quiz }: ModuleQuizGateProps) {
  const { progress, hydrated } = useProgress();
  const moduleId = quiz.moduleId as ModuleId;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center text-lex-navy/60">
        Loading quiz…
      </div>
    );
  }

  if (!isModuleUnlocked(progress, moduleId)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <Lock className="mx-auto size-10 text-lex-navy/35" aria-hidden />
        <h1 className="mt-4 font-serif text-2xl font-semibold text-lex-navy">
          Quiz locked
        </h1>
        <p className="mt-2 text-lex-navy/70">
          Complete the previous module before taking this quiz.
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
    <LudwittAuthGate
      returnPath={`/quiz/${moduleId}`}
      title="Sign in to take the quiz"
      description="LexLearn uses Ludwitt to identify you before recording quiz results and unlocking the next module."
    >
      <QuizView quiz={quiz} />
    </LudwittAuthGate>
  );
}
