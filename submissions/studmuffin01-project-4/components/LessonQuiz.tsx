"use client";

import { useEffect, useMemo, useState } from "react";
import type { LessonQuiz as LessonQuizData } from "@/content/lesson-quizzes";
import { acknowledgeExercise, isExerciseComplete } from "@/lib/exercise-progress";
import { PROGRESS_RESET_EVENT } from "@/lib/progress-reset";

type Props = {
  quiz: LessonQuizData;
};

function answersKey(moduleSlug: string) {
  return `score-course-lesson-answers-v1:${moduleSlug}`;
}

export function LessonQuiz({ quiz }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    function hydrate() {
      try {
        const raw = window.localStorage.getItem(answersKey(quiz.moduleSlug));
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, string>;
          if (parsed && typeof parsed === "object") {
            setAnswers(parsed);
          } else {
            setAnswers({});
          }
        } else {
          setAnswers({});
        }
      } catch {
        setAnswers({});
      }
      setSubmitted(isExerciseComplete(quiz.moduleSlug));
      setSubmitError(null);
    }

    hydrate();
    window.addEventListener(PROGRESS_RESET_EVENT, hydrate);
    return () => window.removeEventListener(PROGRESS_RESET_EVENT, hydrate);
  }, [quiz.moduleSlug]);

  const allAnswered = useMemo(
    () => quiz.questions.every((q) => Boolean(answers[q.id])),
    [answers, quiz.questions],
  );

  const unansweredCount = quiz.questions.length - Object.keys(answers).filter((id) =>
    quiz.questions.some((q) => q.id === id && answers[id]),
  ).length;

  function select(qid: string, choiceId: string) {
    if (submitted) return;
    setSubmitError(null);
    setAnswers((prev) => ({ ...prev, [qid]: choiceId }));
  }

  function submit() {
    if (!allAnswered) {
      setSubmitError(
        `Select an answer for every question before submitting (${unansweredCount} still unanswered).`,
      );
      return;
    }

    setSubmitted(true);
    setSubmitError(null);
    window.localStorage.setItem(
      answersKey(quiz.moduleSlug),
      JSON.stringify(answers),
    );
    acknowledgeExercise(quiz.moduleSlug);

    const nextScore = quiz.questions.filter((q) => {
      const choice = q.choices.find((c) => c.id === answers[q.id]);
      return choice?.correct;
    }).length;

    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "quiz_submitted",
        metadata: {
          module: quiz.moduleSlug,
          score: nextScore,
          total: quiz.questions.length,
        },
      }),
    }).catch(() => {});
  }

  const score = submitted
    ? quiz.questions.filter((q) => {
        const choice = q.choices.find((c) => c.id === answers[q.id]);
        return choice?.correct;
      }).length
    : null;

  return (
    <div className="lesson-quiz">
      <div className="exercise">
        <strong>{quiz.title}</strong>
        <p style={{ margin: "0.5rem 0 0" }}>{quiz.intro}</p>
      </div>

      {quiz.questions.map((q, index) => {
        const userChoiceId = answers[q.id];
        const correctChoice = q.choices.find((c) => c.correct);
        const userChoice = q.choices.find((c) => c.id === userChoiceId);
        const isCorrect = Boolean(userChoice?.correct);

        return (
          <div key={q.id}>
            {q.partHeading ? (
              <div className="quiz-part-heading" role="heading" aria-level={2}>
                {q.partHeading}
              </div>
            ) : null}
            <div className="panel">
              <h2
                style={{ fontSize: "1.1rem", whiteSpace: "pre-line" }}
              >
                {index + 1}. {q.prompt}
              </h2>
              {q.choices.map((c) => {
                let state: string | undefined;
                if (submitted) {
                  if (c.correct) state = "correct";
                  else if (userChoiceId === c.id) state = "wrong";
                } else if (userChoiceId === c.id) {
                  state = "selected";
                }
                const letter = c.id.toUpperCase();
                return (
                  <button
                    key={c.id}
                    type="button"
                    className="quiz-option"
                    data-state={state}
                    onClick={() => select(q.id, c.id)}
                    disabled={submitted}
                  >
                    <span className="quiz-letter">{letter}.</span>
                    <span className="quiz-choice-text">{c.text}</span>
                  </button>
                );
              })}

              {submitted && userChoice && correctChoice ? (
                <p
                  className={
                    isCorrect ? "quiz-result-ok" : "quiz-result-miss"
                  }
                >
                  {isCorrect ? (
                    <>
                      Your answer: <strong>{userChoice.id.toUpperCase()}</strong> —
                      correct.
                    </>
                  ) : (
                    <>
                      Your answer:{" "}
                      <strong className="quiz-result-wrong-letter">
                        {userChoice.id.toUpperCase()}
                      </strong>{" "}
                      (incorrect). Correct answer:{" "}
                      <strong className="quiz-result-right-letter">
                        {correctChoice.id.toUpperCase()}
                      </strong>
                      .
                    </>
                  )}
                </p>
              ) : null}

              {submitted ? <p className="faint">{q.explain}</p> : null}
            </div>
          </div>
        );
      })}

      {!submitted ? (
        <div>
          <button
            type="button"
            className="btn"
            onClick={submit}
            disabled={!allAnswered}
          >
            Submit answers
          </button>
          {!allAnswered ? (
            <p className="faint" style={{ marginTop: "0.5rem" }}>
              Answer every question to enable submit
              {unansweredCount > 0 ? ` (${unansweredCount} remaining)` : ""}.
            </p>
          ) : null}
          {submitError ? (
            <p className="quiz-submit-error" style={{ marginTop: "0.5rem" }}>
              {submitError}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="muted">
          Submitted
          {score !== null ? ` — ${score} / ${quiz.questions.length} correct.` : "."}{" "}
          Review your answers above, then mark the module complete.
        </p>
      )}
    </div>
  );
}
