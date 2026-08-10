"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Trophy } from "lucide-react";
import { LegalDisclaimer } from "@/components/layout/legal-disclaimer";
import { Button } from "@/components/ui/button";
import type { QuizContent } from "@/lib/course/types";
import { recordQuizAttempt } from "@/lib/progress/storage";
import { useProgress } from "@/hooks/use-progress";
import { cn } from "@/lib/utils";

type QuizViewProps = {
  quiz: QuizContent;
};

export function QuizView({ quiz }: QuizViewProps) {
  const { completeQuiz } = useProgress();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    return quiz.questions.reduce((total, question) => {
      if (answers[question.id] === question.correctIndex) return total + 1;
      return total;
    }, 0);
  }, [answers, quiz.questions]);

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);
  const passed = score >= quiz.passThreshold;

  const handleSelect = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => {
      if (prev[questionId] !== undefined) return prev;
      return { ...prev, [questionId]: optionIndex };
    });
  };

  const handleSubmit = () => {
    if (!allAnswered || submitted) return;
    const finalScore = quiz.questions.reduce((total, question) => {
      if (answers[question.id] === question.correctIndex) return total + 1;
      return total;
    }, 0);
    setSubmitted(true);
    recordQuizAttempt(finalScore);
    if (finalScore >= quiz.passThreshold) {
      completeQuiz(quiz.moduleId, finalScore, quiz.questions.length);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-lex-gold">
          Module {quiz.moduleId} quiz
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-lex-navy sm:text-4xl">
          {quiz.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-lex-navy/75">
          {quiz.intro}
        </p>
        <div className="mt-4">
          <LegalDisclaimer />
        </div>
      </header>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <QuizQuestionCardWrapper
            key={question.id}
            question={question}
            index={index}
            total={quiz.questions.length}
            selected={answers[question.id]}
            onSelect={(optionIndex) => handleSelect(question.id, optionIndex)}
          />
        ))}
      </div>

      {!submitted ? (
        <div className="mt-8">
          <Button
            size="lg"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="h-11 rounded-lg bg-lex-navy px-6 text-white hover:bg-lex-navy/90 disabled:opacity-50"
          >
            Submit quiz
          </Button>
          {!allAnswered && (
            <p className="mt-2 text-sm text-lex-navy/60">
              Answer all questions to submit.
            </p>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "mt-8 rounded-2xl border p-6",
            passed
              ? "border-emerald-200 bg-emerald-50/80"
              : "border-amber-200 bg-amber-50/80"
          )}
          role="status"
        >
          <div className="flex items-start gap-3">
            <Trophy
              className={cn(
                "size-6 shrink-0",
                passed ? "text-emerald-600" : "text-amber-600"
              )}
            />
            <div>
              <h2 className="font-serif text-xl font-semibold text-lex-navy">
                {passed ? "Well done!" : "Keep practising"}
              </h2>
              <p className="mt-1 text-lex-navy/80">
                You scored {score} out of {quiz.questions.length}. Pass mark:{" "}
                {quiz.passThreshold} correct answers.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {passed ? (
                  <Link
                    href="/learn"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-lex-navy px-6 text-sm font-medium text-white hover:bg-lex-navy/90"
                  >
                    Back to modules
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    className="h-11 border-lex-navy/20"
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                    }}
                  >
                    Retry quiz
                  </Button>
                )}
                <Link
                  href={`/learn/${quiz.moduleId}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-lex-navy/20 bg-white px-6 text-sm font-medium text-lex-navy hover:bg-lex-pale"
                >
                  <BookOpen className="size-4" />
                  Review lesson
                </Link>
                {passed && (
                  <Link
                    href="/progress"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-lex-navy/20 bg-white px-6 text-sm font-medium text-lex-navy hover:bg-lex-pale"
                  >
                    View progress
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type QuizQuestionCardWrapperProps = {
  question: QuizContent["questions"][number];
  index: number;
  total: number;
  selected?: number;
  onSelect: (optionIndex: number) => void;
};

function QuizQuestionCardWrapper({
  question,
  index,
  total,
  selected,
  onSelect,
}: QuizQuestionCardWrapperProps) {
  const answered = selected !== undefined;
  const isCorrect = selected === question.correctIndex;

  return (
    <article
      className="rounded-2xl border border-lex-navy/10 bg-white p-6 shadow-sm"
      aria-labelledby={`question-${question.id}-title`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-lex-gold">
        Question {index + 1} of {total}
      </p>
      <h2
        id={`question-${question.id}-title`}
        className="mt-2 font-serif text-lg font-semibold text-lex-navy sm:text-xl"
      >
        {question.prompt}
      </h2>

      <fieldset className="mt-5 space-y-2">
        <legend className="sr-only">Answer options for question {index + 1}</legend>
        {question.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const isAnswer = optionIndex === question.correctIndex;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(optionIndex)}
              disabled={answered}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                !answered &&
                  "border-lex-navy/15 bg-white hover:border-lex-navy/30 hover:bg-lex-pale/50",
                answered &&
                  isAnswer &&
                  "border-emerald-300 bg-emerald-50 text-emerald-900",
                answered &&
                  isSelected &&
                  !isAnswer &&
                  "border-red-200 bg-red-50 text-red-900",
                answered &&
                  !isSelected &&
                  !isAnswer &&
                  "border-lex-navy/8 bg-lex-pale/30 text-lex-navy/50"
              )}
              aria-pressed={isSelected}
            >
              {option}
            </button>
          );
        })}
      </fieldset>

      {answered && (
        <p
          className={cn(
            "mt-4 rounded-lg border p-4 text-sm",
            isCorrect
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
              : "border-amber-200 bg-amber-50/80 text-amber-950"
          )}
          role="status"
        >
          {question.explanation}
        </p>
      )}
    </article>
  );
}
