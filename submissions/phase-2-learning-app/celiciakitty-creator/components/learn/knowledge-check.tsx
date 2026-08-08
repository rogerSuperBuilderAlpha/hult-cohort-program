"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { KnowledgeCheckQuestion } from "@/lib/course/types";
import { cn } from "@/lib/utils";

type KnowledgeCheckProps = {
  question: KnowledgeCheckQuestion;
};

export function KnowledgeCheck({ question }: KnowledgeCheckProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const isCorrect = selected === question.correctIndex;
  const answered = selected !== null;

  return (
    <fieldset className="space-y-4">
      <legend className="font-medium text-lex-navy">{question.prompt}</legend>
      <ul className="space-y-2" role="list">
        {question.options.map((option, index) => {
          const isSelected = selected === index;
          const isAnswer = index === question.correctIndex;

          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                disabled={answered && !isSelected}
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
            </li>
          );
        })}
      </ul>

      {answered && (
        <div
          className={cn(
            "flex gap-3 rounded-lg border p-4 text-sm",
            isCorrect
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
              : "border-amber-200 bg-amber-50/80 text-amber-950"
          )}
          role="status"
        >
          {isCorrect ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          )}
          <p>{question.explanation}</p>
        </div>
      )}

      {answered && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSelected(null)}
          className="border-lex-navy/15"
        >
          Try again
        </Button>
      )}
    </fieldset>
  );
}
