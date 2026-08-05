"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { track } from "@/components/SessionHeartbeat";

type Quiz = {
  prompt: string;
  choices: string[];
  answerIndex: number;
  explain: string;
};

export function LessonClient({
  slug,
  title,
  body,
  quiz,
  canTrack,
}: {
  slug: string;
  title: string;
  body: string[];
  quiz: Quiz;
  canTrack: boolean;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!canTrack) return;
    void track("lesson_started", { lesson_id: slug });
  }, [slug, canTrack]);

  function submitQuiz() {
    if (choice === null) return;
    startTransition(async () => {
      if (canTrack) {
        await track("quiz_submitted", {
          lesson_id: slug,
          correct: choice === quiz.answerIndex,
          choice,
        });
      }
      setSubmitted(true);
    });
  }

  function complete() {
    startTransition(async () => {
      if (canTrack) {
        await track("lesson_completed", { lesson_id: slug });
      }
      setDone(true);
    });
  }

  return (
    <div className="lesson-flow">
      <header className="lesson-head">
        <p className="eyebrow">Lesson</p>
        <h1>{title}</h1>
      </header>

      <div className="lesson-body">
        {body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <section className="quiz" aria-labelledby="quiz-title">
        <h2 id="quiz-title">Check</h2>
        <p className="quiz-prompt">{quiz.prompt}</p>
        <ul className="choices">
          {quiz.choices.map((c, i) => (
            <li key={c}>
              <button
                type="button"
                className={choice === i ? "choice selected" : "choice"}
                onClick={() => !submitted && setChoice(i)}
                disabled={submitted}
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
        {!submitted ? (
          <button
            type="button"
            className="btn primary"
            disabled={choice === null || pending}
            onClick={submitQuiz}
          >
            Submit answer
          </button>
        ) : (
          <p className={choice === quiz.answerIndex ? "feedback ok" : "feedback bad"}>
            {choice === quiz.answerIndex ? "Correct. " : "Not quite. "}
            {quiz.explain}
          </p>
        )}
      </section>

      <footer className="lesson-foot">
        {!done ? (
          <button type="button" className="btn" disabled={pending} onClick={complete}>
            Mark lesson complete
          </button>
        ) : (
          <p className="feedback ok">
            {canTrack ? "Lesson completed — event sent to Ludwitt." : "Lesson marked complete (preview — launch from Ludwitt to count)."}
          </p>
        )}
        <Link href="/learn" className="text-link">
          All lessons
        </Link>
      </footer>
    </div>
  );
}
