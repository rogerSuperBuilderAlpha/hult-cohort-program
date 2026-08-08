"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import {
  CATEGORY_FILTERS,
  formatAnswerForReview,
  questionBank,
  type CategoryFilter,
  type Question,
} from "@/lib/questions";
import {
  countMastered,
  loadBestStreak,
  loadDeckMode,
  loadMasteryMap,
  recordMastery,
  saveBestStreak,
  saveDeckMode,
  type MasteryMap,
} from "@/lib/persistence";
import {
  createInitialSessionState,
  hasStartedPractice,
  isSessionActive,
  sessionProgress,
  sessionReducer,
  type DeckMode,
} from "@/lib/session";
import {
  completeSession,
  formatEventLog,
  logTelemetryEvent,
  resolveJwt,
  type TelemetryEventType,
} from "@/lib/telemetry";

export default function Home() {
  const [state, dispatch] = useReducer(
    sessionReducer,
    undefined,
    () => createInitialSessionState(0, "All"),
  );
  const [jwt, setJwt] = useState<string | null>(null);
  const [eventsLog, setEventsLog] = useState<string[]>([]);
  const [masteryMap, setMasteryMap] = useState<MasteryMap>({});
  const masteryRef = useRef<MasteryMap>({});
  const summaryPostedRef = useRef<string | null>(null);
  const bankSize = questionBank.length;

  const logEvent = (type: TelemetryEventType | string, details: object) => {
    setEventsLog((prev) => [
      formatEventLog(type, details),
      ...prev.slice(0, 3),
    ]);
    void logTelemetryEvent(type, details);
  };

  useEffect(() => {
    const token = resolveJwt();
    setJwt(token);

    const savedBest = loadBestStreak();
    const savedMastery = loadMasteryMap();
    const savedMode = loadDeckMode();
    masteryRef.current = savedMastery;
    setMasteryMap(savedMastery);

    dispatch({
      type: "INIT_SESSION",
      category: "All",
      deckMode: savedMode,
      bestStreak: savedBest,
      mastery: savedMastery,
    });

    logEvent("APP_INITIALIZED", {
      timestamp: new Date().toLocaleTimeString(),
      restoredBestStreak: savedBest,
      masteredCount: countMastered(savedMastery),
      deckMode: savedMode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  useEffect(() => {
    if (state.phase === "summary") return;
    const timer = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(timer);
  }, [state.phase]);

  useEffect(() => {
    saveBestStreak(state.bestStreak);
  }, [state.bestStreak]);

  useEffect(() => {
    if (state.phase !== "summary") return;

    const key = [
      state.selectedCategory,
      state.practiceScore,
      state.practiceTotal,
      state.rematchScore,
      state.rematchTotal,
      state.missedQuestions.length,
    ].join(":");

    if (summaryPostedRef.current === key) return;
    summaryPostedRef.current = key;

    const payload = {
      finalScore: state.practiceScore,
      total: state.practiceTotal,
      bestStreak: state.bestStreak,
      masteredTotal: countMastered(masteryRef.current),
      seconds: state.seconds,
      missedCount: state.missedQuestions.length,
      rematchScore: state.rematchScore,
      rematchTotal: state.rematchTotal,
      composition: state.composition,
      category: state.selectedCategory,
      deckMode: state.deckMode,
    };

    logEvent("SESSION_COMPLETED", payload);
    void completeSession(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- post once per summary signature
  }, [state.phase, state.practiceScore, state.rematchScore]);

  const initSession = (
    category: CategoryFilter = state.selectedCategory,
    deckMode: DeckMode = state.deckMode,
  ) => {
    summaryPostedRef.current = null;
    saveDeckMode(deckMode);
    dispatch({
      type: "INIT_SESSION",
      category,
      deckMode,
      bestStreak: state.bestStreak,
      mastery: masteryRef.current,
    });
    logEvent("SESSION_MODE_SET", { deckMode, category });
  };

  const switchDeckMode = (deckMode: DeckMode) => {
    if (deckMode === state.deckMode) return;
    if (
      hasStartedPractice(state) &&
      !window.confirm("Switch mode and start a new session?")
    ) {
      return;
    }
    initSession(state.selectedCategory, deckMode);
  };

  const handleResponse = (
    success: boolean,
    selectedOption?: string | null,
  ) => {
    const currentQ = state.questions[state.index];
    if (!currentQ || state.showExplanation) return;

    const nextStreak = success ? state.streak + 1 : 0;
    const nextMastery = recordMastery(
      masteryRef.current,
      currentQ.id,
      success,
    );
    masteryRef.current = nextMastery;
    setMasteryMap(nextMastery);

    logEvent("QUESTION_ANSWERED", {
      questionId: currentQ.id,
      success,
      streak: nextStreak,
      box: nextMastery[String(currentQ.id)]?.box,
      mastery: nextMastery[String(currentQ.id)]?.status,
      phase: state.phase,
    });

    if (!success) {
      logEvent("EXPLANATION_VIEWED", {
        questionId: currentQ.id,
        explanation: currentQ.explanation,
      });
    }

    dispatch({
      type: "SUBMIT_ANSWER",
      success,
      selectedOption:
        selectedOption !== undefined ? selectedOption : state.selectedOption,
    });
  };

  const startRematch = () => {
    summaryPostedRef.current = null;
    dispatch({ type: "START_REMATCH" });
    logEvent("REMATCH_STARTED", {
      count: state.missedQuestions.length,
      category: state.selectedCategory,
    });
  };

  const currentQ: Question | undefined = state.questions[state.index];
  const progress = sessionProgress(state);
  const masteredCount = countMastered(masteryMap);
  const active = isSessionActive(state);
  const modeLabel =
    state.phase === "rematch"
      ? "Rematch Mode"
      : state.deckMode === "explore"
        ? "Explore Mode"
        : "Adaptive Mode";
  const sessionLocked =
    state.phase === "rematch" || hasStartedPractice(state);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-gradient-to-tr from-gray-950 via-slate-900 to-red-950 text-white font-sans">
      <div className="w-full max-w-2xl flex justify-between items-center bg-gray-900/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-800 shadow-lg">
        <div>
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
            🇹🇹 TriniIQ Masterclass{" "}
            <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/30">
              {modeLabel}
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Ludwitt Learning Engineering Suite
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700 text-center">
            <span className="block text-gray-400 text-[10px]">STREAK</span>
            <span className="font-bold text-amber-400">🔥 {state.streak}</span>
          </div>
          <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700 text-center">
            <span className="block text-gray-400 text-[10px]">BEST</span>
            <span className="font-bold text-amber-300">{state.bestStreak}</span>
          </div>
          <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700 text-center">
            <span className="block text-gray-400 text-[10px]">TIME</span>
            <span className="font-bold text-red-300">⏱️ {state.seconds}s</span>
          </div>
          <div className="bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700 text-center hidden sm:block">
            <span className="block text-gray-400 text-[10px]">MASTERY</span>
            <span className="font-bold text-emerald-400">
              {masteredCount}/{bankSize}
            </span>
          </div>
          <span
            className={`text-[10px] px-2.5 py-1 rounded-lg font-mono ${
              jwt
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            }`}
          >
            {jwt ? "🔒 Secured" : "⚠️ Standalone"}
          </span>
        </div>
      </div>

      <div className="max-w-2xl w-full bg-gray-950/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-800/80 my-auto">
        {active && state.phase === "practice" && (
          <div className="flex gap-2 mb-3">
            {(
              [
                ["adaptive", "Adaptive"],
                ["explore", "Explore"],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => switchDeckMode(mode)}
                className={`text-xs px-3 py-1.5 rounded-full border transition font-semibold ${
                  state.deckMode === mode
                    ? "bg-amber-500/20 border-amber-400 text-amber-200"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {active && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === state.selectedCategory) return;
                  if (
                    sessionLocked &&
                    !window.confirm("Change category and restart this session?")
                  ) {
                    return;
                  }
                  initSession(cat, state.deckMode);
                }}
                disabled={state.phase === "rematch"}
                className={`text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition font-medium ${
                  state.selectedCategory === cat
                    ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white disabled:opacity-40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {active && state.phase === "practice" && (
          <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
            {state.deckMode === "adaptive"
              ? "Adaptive reviews your weak cards first, then due reviews, then a few new ones."
              : "Explore shuffles randomly across the category so you can see more of the bank."}
          </p>
        )}

        {active &&
          state.phase === "practice" &&
          state.composition &&
          state.composition.total > 0 && (
            <p className="text-[11px] text-gray-500 mb-4">
              {state.deckMode === "explore" ? "Random draw" : "Session mix"}:{" "}
              {state.composition.weak} weak · {state.composition.due} due ·{" "}
              {state.composition.fresh} new
              {state.composition.strong > 0
                ? ` · ${state.composition.strong} review`
                : ""}
            </p>
          )}

        {active && state.questions.length > 0 && currentQ ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs uppercase tracking-widest text-red-400 font-extrabold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                {currentQ.category}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {state.phase === "rematch" ? "Rematch " : "Question "}
                <strong className="text-white">{state.index + 1}</strong> of{" "}
                {state.questions.length}
              </span>
            </div>

            <div className="w-full bg-gray-900 h-2 rounded-full mb-6 overflow-hidden border border-gray-800">
              <div
                className="bg-gradient-to-r from-red-500 to-amber-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {currentQ.type === "flashcard" ? (
              <div className="flex flex-col">
                <div
                  onClick={() => {
                    if (state.showExplanation) return;
                    const next = !state.flipped;
                    dispatch({ type: "SET_FLIPPED", flipped: next });
                    logEvent("CARD_FLIPPED", { questionId: currentQ.id });
                  }}
                  className="relative bg-gradient-to-b from-gray-900 to-gray-900/90 border border-gray-800 hover:border-red-500/50 p-8 rounded-2xl cursor-pointer min-h-[220px] flex flex-col items-center justify-center text-center transition-all shadow-inner group"
                >
                  <p className="text-xl font-semibold text-gray-100 leading-relaxed mb-4">
                    {state.flipped ? currentQ.answer : currentQ.question}
                  </p>
                  {!state.showExplanation && (
                    <span className="text-xs text-red-400/80 group-hover:text-red-300 transition">
                      {state.flipped
                        ? "✨ Click to review question"
                        : "🔄 Click card to flip for answer"}
                    </span>
                  )}
                </div>

                {state.showExplanation ? (
                  <ExplanationPanel
                    question={currentQ}
                    success={state.lastSuccess === true}
                    onContinue={() =>
                      dispatch({ type: "CONTINUE_AFTER_FEEDBACK" })
                    }
                  />
                ) : state.flipped ? (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={() => handleResponse(false)}
                      className="bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-semibold py-3.5 rounded-xl transition"
                    >
                      Still Learning ❌
                    </button>
                    <button
                      onClick={() => handleResponse(true)}
                      className="bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-semibold py-3.5 rounded-xl transition"
                    >
                      Mastered ✅
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      dispatch({ type: "SET_FLIPPED", flipped: true });
                      logEvent("ANSWER_REVEALED", {
                        questionId: currentQ.id,
                      });
                    }}
                    className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-red-600/25"
                  >
                    Reveal Answer
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl mb-6 min-h-[100px] flex items-center justify-center text-center">
                  <p className="text-lg font-semibold text-gray-100">
                    {currentQ.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = state.selectedOption === opt;
                    const isCorrect = opt === currentQ.answer;
                    let btnStyle =
                      "bg-gray-900 border-gray-800 text-gray-200 hover:border-red-500";
                    if (state.selectedOption !== null || state.showExplanation) {
                      if (isCorrect)
                        btnStyle =
                          "bg-emerald-500/20 border-emerald-500 text-emerald-300";
                      else if (isSelected)
                        btnStyle =
                          "bg-red-500/20 border-red-500 text-red-300";
                    }

                    return (
                      <button
                        key={`${currentQ.id}-${i}-${opt}`}
                        disabled={
                          state.selectedOption !== null || state.showExplanation
                        }
                        onClick={() => {
                          handleResponse(opt === currentQ.answer, opt);
                        }}
                        className={`border p-4 rounded-xl font-medium text-left transition flex justify-between items-center ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {(state.selectedOption !== null ||
                          state.showExplanation) &&
                          isCorrect && <span>✅</span>}
                        {state.selectedOption === opt && !isCorrect && (
                          <span>❌</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {state.showExplanation && (
                  <ExplanationPanel
                    question={currentQ}
                    success={state.lastSuccess === true}
                    onContinue={() =>
                      dispatch({ type: "CONTINUE_AFTER_FEEDBACK" })
                    }
                  />
                )}
              </div>
            )}
          </div>
        ) : state.phase === "summary" ? (
          <div className="text-center py-6">
            <div className="inline-block p-4 bg-red-500/10 border border-red-500/30 rounded-full mb-3 text-3xl">
              🇹🇹
            </div>
            <h2 className="text-3xl font-black mb-2">
              {state.rematchTotal > 0 && state.rematchScore >= 0
                ? "Review Complete!"
                : "Module Completed!"}
            </h2>
            <p className="text-gray-400 mb-6">
              {state.missedQuestions.length > 0 && state.rematchTotal === 0
                ? "Solid session — rematch your weak cards while they’re fresh."
                : "You finished an adaptive T&T learning session."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 max-w-lg mx-auto">
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                <span className="block text-gray-400 text-xs mb-1">SCORE</span>
                <span className="text-xl font-bold text-red-400">
                  {state.practiceScore}/{state.practiceTotal}
                </span>
              </div>
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                <span className="block text-gray-400 text-xs mb-1">
                  BEST STREAK
                </span>
                <span className="text-xl font-bold text-amber-400">
                  🔥 {state.bestStreak}
                </span>
              </div>
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                <span className="block text-gray-400 text-xs mb-1">
                  TOTAL TIME
                </span>
                <span className="text-xl font-bold text-red-300">
                  {state.seconds}s
                </span>
              </div>
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                <span className="block text-gray-400 text-xs mb-1">MASTERY</span>
                <span className="text-xl font-bold text-emerald-400">
                  {masteredCount}/{bankSize}
                </span>
              </div>
            </div>

            {state.rematchTotal > 0 && (
              <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-sm text-emerald-300 font-semibold">
                  Rematch: {state.rematchScore}/{state.rematchTotal} recovered
                </p>
              </div>
            )}

            {state.missedQuestions.length > 0 && (
              <div className="mb-6 bg-gray-900/60 p-4 rounded-xl border border-gray-800 text-left">
                <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-2">
                  Weak concepts ({state.missedQuestions.length}):
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto text-xs text-gray-300">
                  {state.missedQuestions.map((q) => (
                    <div key={q.id} className="border-b border-gray-800 pb-1">
                      <strong className="text-white">{q.question}</strong> —{" "}
                      <span className="text-red-300">
                        {formatAnswerForReview(q)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {state.missedQuestions.length > 0 && state.rematchTotal === 0 && (
                <button
                  onClick={startRematch}
                  className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-amber-500/25"
                >
                  Review {state.missedQuestions.length} weak cards (~3 min)
                </button>
              )}
              <button
                onClick={() =>
                  initSession(state.selectedCategory, state.deckMode)
                }
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-red-600/25"
              >
                Practice Again (
                {state.deckMode === "explore" ? "Explore" : "Adaptive"}) 🚀
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="w-full max-w-2xl bg-black/40 border border-gray-800/80 p-3 rounded-xl text-[10px] font-mono text-gray-400 mt-4">
        <div className="text-red-400 font-bold mb-1 uppercase tracking-wider flex items-center justify-between">
          <span>Telemetry Stream (Platform Integration)</span>
          <span className="text-emerald-400">● Live Feed</span>
        </div>
        {eventsLog.length === 0 ? (
          <div>Initializing session telemetry...</div>
        ) : (
          eventsLog.map((log, i) => (
            <div key={i} className="truncate">
              {log}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

function ExplanationPanel({
  question,
  success,
  onContinue,
}: {
  question: Question;
  success: boolean;
  onContinue: () => void;
}) {
  return (
    <div
      className={`mt-6 rounded-2xl border p-4 text-left ${
        success
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-amber-500/10 border-amber-500/30"
      }`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-wider mb-2 ${
          success ? "text-emerald-300" : "text-amber-300"
        }`}
      >
        {success ? "Nice — locked in" : "Why this matters"}
      </p>
      <p className="text-sm text-gray-200 leading-relaxed mb-1">
        <span className="text-gray-400">Answer: </span>
        {formatAnswerForReview(question)}
      </p>
      <p className="text-sm text-gray-300 leading-relaxed mb-4">
        {question.explanation}
      </p>
      <button
        onClick={onContinue}
        className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition"
      >
        Continue
      </button>
    </div>
  );
}
