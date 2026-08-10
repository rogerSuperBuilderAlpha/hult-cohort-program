"use client";

import { useEffect, useState } from "react";
import {
  EXERCISE_COMPLETE_EVENT,
  acknowledgeExercise,
  isExerciseComplete,
  usesInteractiveExercise,
  usesLessonQuiz,
  usesScoredExercise,
} from "@/lib/exercise-progress";
import {
  MODULE_COMPLETE_EVENT,
  isModuleComplete,
  markModuleComplete,
} from "@/lib/module-completion";
import { PROGRESS_RESET_EVENT } from "@/lib/progress-reset";

type Props = {
  moduleSlug: string;
};

export function CompleteModuleButton({ moduleSlug }: Props) {
  const [exerciseDone, setExerciseDone] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const interactive = usesInteractiveExercise(moduleSlug);
  const scored = usesScoredExercise(moduleSlug);
  const lessonQuiz = usesLessonQuiz(moduleSlug);

  useEffect(() => {
    function refresh() {
      setExerciseDone(isExerciseComplete(moduleSlug));
      setDone(isModuleComplete(moduleSlug));
    }
    refresh();

    function onComplete(event: Event) {
      const detail = (event as CustomEvent<{ moduleSlug?: string }>).detail;
      if (!detail?.moduleSlug || detail.moduleSlug === moduleSlug) {
        refresh();
      }
    }

    window.addEventListener(EXERCISE_COMPLETE_EVENT, onComplete);
    window.addEventListener(MODULE_COMPLETE_EVENT, onComplete);
    window.addEventListener(PROGRESS_RESET_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EXERCISE_COMPLETE_EVENT, onComplete);
      window.removeEventListener(MODULE_COMPLETE_EVENT, onComplete);
      window.removeEventListener(PROGRESS_RESET_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [moduleSlug]);

  async function complete() {
    if (!exerciseDone || done) return;
    setBusy(true);
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "lesson_completed",
          metadata: { module: moduleSlug },
        }),
      });
      markModuleComplete(moduleSlug);
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {!interactive && !exerciseDone ? (
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginRight: "0.75rem", marginBottom: "0.75rem" }}
          onClick={() => {
            acknowledgeExercise(moduleSlug);
            setExerciseDone(true);
          }}
        >
          I’ve completed the exercise
        </button>
      ) : null}

      <button
        type="button"
        className="btn btn-secondary"
        onClick={complete}
        disabled={!exerciseDone || busy || done}
      >
        {done ? "Completed" : busy ? "Saving…" : "Mark module complete"}
      </button>

      {!exerciseDone ? (
        <p className="faint" style={{ marginTop: "0.5rem" }}>
          {scored
            ? "Score your prompt above to unlock module completion."
            : lessonQuiz
              ? "Submit your lesson answers above to unlock module completion."
              : "Finish the exercise, then confirm above to unlock module completion."}
        </p>
      ) : null}
    </div>
  );
}
