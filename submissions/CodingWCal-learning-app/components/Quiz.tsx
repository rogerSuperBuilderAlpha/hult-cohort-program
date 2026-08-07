"use client";

import { useState } from "react";
import { EventTracker } from "./EventTracker";
import type { QuizQuestion } from "@/lib/content";

type Props = {
  lessonSlug: string;
  moduleSlug: string;
  quiz: QuizQuestion[];
};

export function Quiz({ lessonSlug, moduleSlug, quiz }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  if (!quiz || quiz.length === 0) return null;

  const allAnswered = answers.every((a) => a !== null);
  const score = submitted
    ? quiz.filter((q, i) => q.answer === answers[i]).length
    : 0;

  function submit() {
    if (!allAnswered) return;
    setSubmitted(true);
  }

  return (
    <div className="mt-10 rounded-2xl border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold mb-4">Check understanding</h3>
      <div className="space-y-6">
        {quiz.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <div key={qi}>
              <p className="text-sm font-medium mb-3">
                {qi + 1}. {q.prompt}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  let cls =
                    "w-full text-left rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm transition";
                  if (!submitted) {
                    cls += chosen === oi ? " border-accent" : " hover:border-accent/50";
                  } else if (oi === q.answer) {
                    cls = "w-full text-left rounded-lg border border-emerald-500/70 bg-emerald-500/10 px-4 py-3 text-sm";
                  } else if (chosen === oi) {
                    cls = "w-full text-left rounded-lg border border-rose-500/70 bg-rose-500/10 px-4 py-3 text-sm";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() =>
                        setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
                      }
                      className={cls}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className="mt-2 text-sm text-muted">{q.explain}</p>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          type="button"
          disabled={!allAnswered}
          onClick={submit}
          className="mt-6 h-11 rounded-full bg-accent px-6 text-sm font-semibold text-background transition hover:brightness-110 disabled:opacity-50"
        >
          Submit
        </button>
      )}
      {submitted && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Score: {score}/{quiz.length}
          </p>
          <p className="text-sm text-muted">
            {score === quiz.length
              ? "Perfect. Great work."
              : "Nice. Review the explanations above and try again."}
          </p>
        </div>
      )}

      <EventTracker
        event={submitted ? "quiz_submitted" : "lesson_started"}
        properties={{ lesson: lessonSlug, module: moduleSlug, score: submitted ? score : null }}
      />
    </div>
  );
}