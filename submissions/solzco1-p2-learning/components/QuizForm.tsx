"use client";

import { useState } from "react";
import Link from "next/link";
import { QUIZ } from "@/lib/lessons";

export function QuizForm() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [eventStatus, setEventStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let correct = 0;
    for (const q of QUIZ) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    setScore(correct);
    setSubmitted(true);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "quiz_submitted",
        metadata: {
          score: correct,
          total: QUIZ.length,
          pct: Math.round((correct / QUIZ.length) * 100),
        },
      }),
    });
    const data = (await res.json()) as { ok?: boolean; channel?: string };
    if (data.ok) setEventStatus(`Quiz event recorded (${data.channel})`);
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      {QUIZ.map((q, i) => (
        <fieldset
          key={q.id}
          className="rounded-lg border border-forge-slate/15 bg-white p-5"
        >
          <legend className="font-medium">
            {i + 1}. {q.prompt}
          </legend>
          <div className="mt-3 space-y-2">
            {q.options.map((opt, idx) => (
              <label
                key={opt}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-forge-paper"
              >
                <input
                  type="radio"
                  name={q.id}
                  value={idx}
                  checked={answers[q.id] === idx}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: idx }))
                  }
                  disabled={submitted}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
          {submitted ? (
            <p
              className={`mt-3 text-sm ${
                answers[q.id] === q.correctIndex
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {answers[q.id] === q.correctIndex ? "Correct." : "Incorrect."}{" "}
              {q.explanation}
            </p>
          ) : null}
        </fieldset>
      ))}

      {!submitted ? (
        <button
          type="submit"
          className="rounded bg-forge-gold px-5 py-2.5 text-sm font-medium text-forge-ink hover:bg-forge-copper hover:text-white"
        >
          Submit quiz
        </button>
      ) : (
        <div className="rounded border border-forge-gold/40 bg-forge-gold/10 p-4">
          <p className="font-semibold">
            Score: {score} / {QUIZ.length}
          </p>
          {eventStatus ? (
            <p className="mt-1 text-xs text-forge-muted">{eventStatus}</p>
          ) : null}
          <Link href="/learn" className="mt-3 inline-block text-sm">
            ← Back to curriculum
          </Link>
        </div>
      )}
    </form>
  );
}
