"use client";

import { useEffect, useMemo, useState } from "react";
import {
  baselineScenario,
  rubricDimensions,
  type BaselineRecord,
  type PromptScoreResult,
} from "@/content/baseline-assessment";
import {
  loadBaseline,
  loadRetest,
  saveBaseline,
  saveRetest,
} from "@/lib/baseline-storage";
import { notifyExerciseComplete } from "@/lib/exercise-progress";
import { PROGRESS_RESET_EVENT, retryModule10Retest } from "@/lib/progress-reset";
import { scorePrompt } from "@/lib/score-rubric";

type Phase = "baseline" | "retest";

type Props = {
  phase: Phase;
};

function moduleSlugForPhase(phase: Phase) {
  return phase === "baseline" ? "cold-open" : "score-card";
}

export function BaselinePromptExercise({ phase }: Props) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<PromptScoreResult | null>(null);
  const [baseline, setBaseline] = useState<BaselineRecord | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [baselineLocked, setBaselineLocked] = useState(false);

  function hydrate() {
    const prior = loadBaseline();
    setBaseline(prior);
    if (phase === "baseline") {
      if (prior?.prompt) {
        setPrompt(prior.prompt);
        setResult(prior.result);
        setBaselineLocked(Boolean(prior.result));
      } else {
        setPrompt("");
        setResult(null);
        setBaselineLocked(false);
      }
      return;
    }

    const priorRetest = loadRetest();
    if (priorRetest?.prompt) {
      setPrompt(priorRetest.prompt);
      setResult(priorRetest.result);
    } else {
      setPrompt("");
      setResult(null);
    }
    setSavedNote(null);
  }

  useEffect(() => {
    hydrate();
    function onReset() {
      hydrate();
    }
    window.addEventListener(PROGRESS_RESET_EVENT, onReset);
    return () => window.removeEventListener(PROGRESS_RESET_EVENT, onReset);
  }, [phase]);

  const showScoreLetters = phase === "retest";

  const comparison = useMemo(() => {
    if (phase !== "retest" || !baseline || !result) return null;
    const delta = result.total - baseline.result.total;
    return { delta, baselineTotal: baseline.result.total };
  }, [phase, baseline, result]);

  function handleScore() {
    if (phase === "baseline" && baselineLocked) return;

    const next = scorePrompt(prompt);
    setResult(next);
    const record: BaselineRecord = {
      version: 1,
      prompt: prompt.trim(),
      result: next,
      savedAt: new Date().toISOString(),
      phase,
    };
    if (phase === "baseline") {
      saveBaseline(record);
      setBaseline(loadBaseline() ?? record);
      setBaselineLocked(true);
      setSavedNote(
        "Baseline locked on this device. You’ll get the same scenario at the end of the course to compare.",
      );
    } else {
      saveRetest(record);
      setSavedNote("Retest saved. Compare your totals below — or try again for practice.");
    }
    notifyExerciseComplete(moduleSlugForPhase(phase));
  }

  function handleRetryRetest() {
    retryModule10Retest();
    setPrompt("");
    setResult(null);
    setSavedNote("Retest cleared. Write a fresh SCORE prompt and score it again.");
  }

  return (
    <div className="baseline-exercise">
      <div className="brief-box">
        <strong>{baselineScenario.title}</strong>
        <p className="muted" style={{ margin: "0.5rem 0" }}>
          {baselineScenario.learnerRole}
        </p>
        <p>
          <strong>What you know</strong>
        </p>
        <ul className="beats">
          {baselineScenario.facts.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="exercise">
        <strong>
          {phase === "baseline"
            ? "Baseline exercise"
            : "Final exercise (same scenario)"}
        </strong>
        <p style={{ margin: "0.5rem 0 0" }}>{baselineScenario.instruction}</p>
        {phase === "baseline" && baselineLocked ? (
          <p className="faint" style={{ marginTop: "0.5rem" }}>
            Baseline is locked after your first score so your starting snapshot
            stays honest.
          </p>
        ) : null}
      </div>

      <label className="prompt-label" htmlFor="baseline-prompt">
        Your Copilot prompt
      </label>
      <textarea
        id="baseline-prompt"
        className="prompt-input"
        rows={10}
        value={prompt}
        readOnly={phase === "baseline" && baselineLocked}
        onChange={(e) => {
          if (phase === "baseline" && baselineLocked) return;
          setPrompt(e.target.value);
          setSavedNote(null);
        }}
        placeholder="Paste or type the prompt you would give Copilot…"
      />

      <div className="cta-row" style={{ marginTop: "0.75rem" }}>
        <button
          type="button"
          className="btn"
          onClick={handleScore}
          disabled={
            prompt.trim().length < 8 ||
            (phase === "baseline" && baselineLocked)
          }
        >
          {phase === "baseline" && baselineLocked
            ? "Baseline locked"
            : "Score my prompt"}
        </button>
        {phase === "retest" && result ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRetryRetest}
          >
            Try again
          </button>
        ) : null}
      </div>

      {savedNote ? (
        <p className="faint" style={{ marginTop: "0.75rem" }}>
          {savedNote}
        </p>
      ) : null}

      {result ? (
        <div className="panel" style={{ marginTop: "1.25rem" }}>
          <h2>
            Score: {result.total} / {result.max}
          </h2>
          {comparison ? (
            <p className="muted" style={{ marginBottom: "1rem" }}>
              Baseline (Module 01) was {comparison.baselineTotal} / {result.max}.{" "}
              {comparison.delta > 0
                ? `Improvement: +${comparison.delta}. Learning shows up here.`
                : comparison.delta === 0
                  ? "Same total as baseline — reopen weak letters below and repair."
                  : `Change: ${comparison.delta}. Use the breakdown to repair the weak letters.`}
            </p>
          ) : (
            <p className="muted" style={{ marginBottom: "1rem" }}>
              This is a diagnostic of your prompt — not a grade on writing polish.
              {showScoreLetters
                ? " Letters map to SCORE."
                : " You’ll learn the SCORE map in the modules ahead; these criteria are what SCORE measures."}
            </p>
          )}

          <ul className="rubric-list">
            {result.dimensions.map((dim) => {
              const meta = rubricDimensions.find((d) => d.letter === dim.letter);
              const label = showScoreLetters
                ? `${dim.letter} — ${meta?.scoreLabel}`
                : meta?.plainLabel;
              const prior = baseline?.result.dimensions.find(
                (d) => d.letter === dim.letter,
              );
              return (
                <li key={dim.letter}>
                  <div className="rubric-head">
                    <strong>{label}</strong>
                    <span>
                      {dim.score} / 2
                      {phase === "retest" && prior
                        ? ` (was ${prior.score})`
                        : ""}
                    </span>
                  </div>
                  <p className="faint">{dim.feedback}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
