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
  trackSlug,
  role,
  setting,
  stage,
  title,
  scenario,
  interviewer,
  playbook,
  debrief,
  canTrack,
}: {
  slug: string;
  trackSlug: string;
  role: string;
  setting: string;
  stage: string;
  title: string;
  scenario: string;
  interviewer: string;
  playbook: string[];
  debrief: Debrief;
  canTrack: boolean;
}) {
  const lessonId = `${trackSlug}/${slug}`;
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!canTrack) return;
    void track("lesson_started", { lesson_id: lessonId, role, stage });
  }, [lessonId, role, stage, canTrack]);

  function submitDebrief() {
    if (choice === null) return;
    startTransition(async () => {
      if (canTrack) {
        await track("quiz_submitted", {
          lesson_id: lessonId,
          role,
          stage,
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
        await track("lesson_completed", { lesson_id: lessonId, role, stage });
      }
      setDone(true);
    });
  }

  return (
    <div className="lesson-flow">
      <header className="lesson-head">
        <p className="eyebrow">
          {role} · {stage}
        </p>
        <h1>{title}</h1>
        <p className="setting-line">{setting}</p>
      </header>

      <aside className="scenario-box">
        <p className="meta">Application scenario</p>
        <p>{scenario}</p>
      </aside>

      <blockquote className="interviewer">
        <p className="meta">Interviewer</p>
        <p>{interviewer}</p>
      </blockquote>

      <div className="lesson-body">
        <h2 className="round-subhead">How you work this question</h2>
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
            End this question
          </button>
        ) : (
          <p className="feedback ok">
            {canTrack
              ? "Question complete — session event sent to Ludwitt."
              : "Question complete (preview — launch from Ludwitt to count)."}
          </p>
        )}
        <Link href={`/practice/${trackSlug}`} className="text-link">
          More {role} questions
        </Link>
      </footer>
    </div>
  );
}

export const LessonClient = InterviewRoundClient;
