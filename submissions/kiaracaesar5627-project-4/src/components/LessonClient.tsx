"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { track } from "@/components/SessionHeartbeat";

type Debrief = {
  prompt: string;
  choices: string[];
  answerIndex: number;
  explain: string;
};

export function InterviewRoundClient({
  slug,
  stage,
  title,
  interviewer,
  playbook,
  debrief,
  canTrack,
}: {
  slug: string;
  stage: string;
  title: string;
  interviewer: string;
  playbook: string[];
  debrief: Debrief;
  canTrack: boolean;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!canTrack) return;
    void track("lesson_started", { lesson_id: slug, round: stage });
  }, [slug, stage, canTrack]);

  function submitDebrief() {
    if (choice === null) return;
    startTransition(async () => {
      if (canTrack) {
        await track("quiz_submitted", {
          lesson_id: slug,
          round: stage,
          correct: choice === debrief.answerIndex,
          choice,
        });
      }
      setSubmitted(true);
    });
  }

  function endRound() {
    startTransition(async () => {
      if (canTrack) {
        await track("lesson_completed", { lesson_id: slug, round: stage });
      }
      setDone(true);
    });
  }

  return (
    <div className="lesson-flow">
      <header className="lesson-head">
        <p className="eyebrow">{stage} round</p>
        <h1>{title}</h1>
      </header>

      <blockquote className="interviewer">
        <p className="meta">Interviewer</p>
        <p>{interviewer}</p>
      </blockquote>

      <div className="lesson-body">
        <h2 className="round-subhead">How you work this round</h2>
        <ol className="playbook">
          {playbook.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <section className="quiz" aria-labelledby="debrief-title">
        <h2 id="debrief-title">Debrief</h2>
        <p className="quiz-prompt">{debrief.prompt}</p>
        <ul className="choices">
          {debrief.choices.map((c, i) => (
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
            onClick={submitDebrief}
          >
            Lock answer
          </button>
        ) : (
          <p className={choice === debrief.answerIndex ? "feedback ok" : "feedback bad"}>
            {choice === debrief.answerIndex ? "Strong read. " : "Rehearse this. "}
            {debrief.explain}
          </p>
        )}
      </section>

      <footer className="lesson-foot">
        {!done ? (
          <button type="button" className="btn" disabled={pending} onClick={endRound}>
            End interview round
          </button>
        ) : (
          <p className="feedback ok">
            {canTrack
              ? "Round complete — session event sent to Ludwitt."
              : "Round complete (preview — launch from Ludwitt to count)."}
          </p>
        )}
        <Link href="/practice" className="text-link">
          All rounds
        </Link>
      </footer>
    </div>
  );
}

/** @deprecated use InterviewRoundClient */
export const LessonClient = InterviewRoundClient;
