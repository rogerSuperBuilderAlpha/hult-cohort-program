"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ensureLessonStarted,
  markContentViewed,
  markLessonComplete,
  submitScenarioAnswer,
} from "@/app/paths/actions";
import { SessionHeartbeat } from "@/app/paths/SessionHeartbeat";
import { MarkdownContent } from "@/components/MarkdownContent";

export type ScenarioOption = { key: string; text: string; score?: number };

export type ScenarioView = {
  id: string;
  kind: string;
  prompt_md: string;
  options: ScenarioOption[];
  correct_key: string | null;
  explanation: string;
};

type Props = {
  disciplineId: string;
  isFullModule: boolean;
  contentMd: string;
  centralQuestion: string;
  scenarios: ScenarioView[];
  initialAnswers: Record<string, string>;
  initialContentViewed: boolean;
  initialKnowledgeScore: number | null;
  initialCompletedAt: string | null;
};

const KIND_ORDER = ["dilemma", "recognition", "knowledge_check", "preview_scenario"];

function kindLabel(kind: string): string {
  switch (kind) {
    case "dilemma":
      return "Opening dilemma";
    case "recognition":
      return "Recognition";
    case "knowledge_check":
      return "Knowledge check";
    case "preview_scenario":
      return "Preview scenario";
    default:
      return kind;
  }
}

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function DisciplineClient({
  disciplineId,
  isFullModule,
  contentMd,
  centralQuestion,
  scenarios,
  initialAnswers,
  initialContentViewed,
  initialKnowledgeScore,
  initialCompletedAt,
}: Props) {
  const [sessionId] = useState(newSessionId);
  const [answers, setAnswers] = useState(initialAnswers);
  const [contentViewed, setContentViewed] = useState(initialContentViewed);
  const [knowledgeScore, setKnowledgeScore] = useState(initialKnowledgeScore);
  const [completedAt, setCompletedAt] = useState(initialCompletedAt);
  const [selections, setSelections] = useState<Record<string, string>>(initialAnswers);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ordered = useMemo(() => {
    return [...scenarios].sort((a, b) => {
      const ai = KIND_ORDER.indexOf(a.kind);
      const bi = KIND_ORDER.indexOf(b.kind);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [scenarios]);

  const dilemma = ordered.find((s) => s.kind === "dilemma");
  const preview = ordered.find((s) => s.kind === "preview_scenario");
  const knowledgeChecks = ordered.filter((s) => s.kind === "knowledge_check");

  const canComplete = useMemo(() => {
    if (completedAt) return false;
    if (!contentViewed) return false;
    if (isFullModule) {
      const dilemmaDone = dilemma ? Boolean(answers[dilemma.id]) : false;
      return dilemmaDone && knowledgeScore != null && knowledgeScore >= 80;
    }
    return preview ? Boolean(answers[preview.id]) : false;
  }, [
    answers,
    completedAt,
    contentViewed,
    dilemma,
    isFullModule,
    knowledgeScore,
    preview,
  ]);

  useEffect(() => {
    startTransition(async () => {
      await ensureLessonStarted(disciplineId, sessionId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disciplineId, sessionId]);

  function onMarkContentViewed() {
    setMessage(null);
    startTransition(async () => {
      const result = await markContentViewed(disciplineId);
      if (!result.ok) {
        setMessage(result.error ?? "Could not mark content viewed");
        return;
      }
      setContentViewed(true);
      setMessage("Content marked as viewed.");
    });
  }

  function onSubmitScenario(scenarioId: string) {
    const selectedKey = selections[scenarioId];
    if (!selectedKey) {
      setMessage("Select an option first.");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await submitScenarioAnswer(
        disciplineId,
        sessionId,
        scenarioId,
        selectedKey,
      );
      if (!result.ok) {
        setMessage(result.error ?? "Submit failed");
        return;
      }
      setAnswers((prev) => ({ ...prev, [scenarioId]: selectedKey }));
      if (result.knowledgeScore != null) {
        setKnowledgeScore(result.knowledgeScore);
      }
      setMessage("Answer saved (quiz_submitted).");
    });
  }

  function onComplete() {
    setMessage(null);
    startTransition(async () => {
      const result = await markLessonComplete(disciplineId, sessionId);
      if (!result.ok) {
        setMessage(result.error ?? "Complete failed");
        return;
      }
      setCompletedAt(new Date().toISOString());
      setMessage("Module completed (lesson_completed).");
    });
  }

  return (
    <div style={{ display: "grid", gap: "2.5rem" }}>
      <SessionHeartbeat disciplineId={disciplineId} sessionId={sessionId} />

      <section
        style={{
          padding: "1rem 1.15rem",
          background: "var(--tef-surface)",
          borderLeft: "3px solid var(--tef-gold)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--tef-sage)",
          }}
        >
          Core AI question
        </p>
        <p style={{ margin: "0.4rem 0 0", fontSize: "1.15rem" }}>{centralQuestion}</p>
      </section>

      <section>
        <MarkdownContent markdown={contentMd} />
        <div style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            className="tef-btn tef-btn-secondary"
            onClick={onMarkContentViewed}
            disabled={pending || contentViewed}
          >
            {contentViewed ? "Content viewed" : "Mark content as viewed"}
          </button>
        </div>
      </section>

      <section style={{ display: "grid", gap: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", margin: 0 }}>Scenarios</h2>
        {ordered.map((scenario, index) => {
          const saved = answers[scenario.id];
          const isKc = scenario.kind === "knowledge_check";
          return (
            <article
              key={scenario.id}
              style={{
                background: "var(--tef-surface)",
                padding: "1.25rem 1.35rem",
                borderTop: "1px solid #c5d9d4",
              }}
            >
              <p
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--tef-sage)",
                }}
              >
                {kindLabel(scenario.kind)}
                {isKc
                  ? ` ${knowledgeChecks.findIndex((k) => k.id === scenario.id) + 1}`
                  : ` · ${index + 1}`}
              </p>
              <MarkdownContent markdown={scenario.prompt_md} />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmitScenario(scenario.id);
                }}
                style={{ marginTop: "1rem" }}
              >
                {scenario.options.map((opt) => (
                  <label key={opt.key} className="tef-option">
                    <input
                      type="radio"
                      name={`scenario-${scenario.id}`}
                      value={opt.key}
                      checked={(selections[scenario.id] ?? "") === opt.key}
                      onChange={() =>
                        setSelections((prev) => ({
                          ...prev,
                          [scenario.id]: opt.key,
                        }))
                      }
                    />
                    <strong>{opt.key}.</strong> {opt.text}
                  </label>
                ))}
                <button
                  type="submit"
                  className="tef-btn"
                  disabled={pending}
                  style={{ marginTop: "0.75rem" }}
                >
                  {saved ? "Update answer" : "Submit answer"}
                </button>
                {saved ? (
                  <p style={{ marginTop: "0.75rem", color: "var(--tef-muted)", fontSize: "0.9rem" }}>
                    Saved answer: {saved}
                    {scenario.correct_key && saved === scenario.correct_key
                      ? " (matches best / correct key)"
                      : ""}
                    {scenario.explanation ? ` — ${scenario.explanation}` : ""}
                  </p>
                ) : null}
              </form>
            </article>
          );
        })}
      </section>

      {isFullModule ? (
        <section
          style={{
            padding: "1rem 1.15rem",
            background: "var(--tef-surface)",
          }}
        >
          <strong>Knowledge score (best attempt): </strong>
          {knowledgeScore == null ? "—" : `${knowledgeScore}%`}
          <span style={{ color: "var(--tef-muted)" }}>
            {" "}
            (need ≥ 80% to complete)
          </span>
        </section>
      ) : null}

      <section>
        <button
          type="button"
          className="tef-btn"
          onClick={onComplete}
          disabled={pending || Boolean(completedAt) || !canComplete}
        >
          {completedAt ? "Module completed" : "Complete module"}
        </button>
        {!canComplete && !completedAt ? (
          <p style={{ marginTop: "0.75rem", color: "var(--tef-muted)", fontSize: "0.9rem" }}>
            {isFullModule
              ? "Requires: content viewed + dilemma answered + knowledge score ≥ 80%."
              : "Requires: content viewed + preview scenario answered."}
          </p>
        ) : null}
      </section>

      {message ? (
        <p style={{ color: "var(--tef-ink)", fontSize: "0.95rem" }}>{message}</p>
      ) : null}
    </div>
  );
}
