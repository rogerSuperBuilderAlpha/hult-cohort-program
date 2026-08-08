"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { TRACKS, type InterviewQuestion, type InterviewTrack } from "@/lib/questions";

type MeResponse = {
  user: { sub: string; name?: string; email?: string };
  demo?: boolean;
  credits?: { spendableFormatted: string; spendableCents: number };
};

type PracticeState =
  | { phase: "pick" }
  | {
      phase: "active";
      sessionId: string;
      track: InterviewTrack;
      questions: InterviewQuestion[];
      index: number;
      answer: string;
      feedback: string | null;
    }
  | { phase: "done"; track: InterviewTrack; answeredCount: number };

export default function PracticeClient() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<PracticeState>({ phase: "pick" });
  const [status, setStatus] = useState<string | null>(null);
  const [activity, setActivity] = useState<Array<{ eventType: string; createdAt: string }>>(
    [],
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        if (!cancelled) setLoadError("Sign in to practice.");
        return;
      }
      const data = (await res.json()) as MeResponse;
      if (!cancelled) setMe(data);

      const act = await fetch("/api/activity");
      if (act.ok) {
        const payload = await act.json();
        const events = (payload.events?.docs || []).map(
          (doc: { data: { eventType?: string; createdAt?: string } }) => ({
            eventType: String(doc.data.eventType || "event"),
            createdAt: String(doc.data.createdAt || ""),
          }),
        );
        if (!cancelled) setActivity(events.slice(0, 8));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const progress = useMemo(() => {
    if (state.phase !== "active") return null;
    return `${state.index + 1} / ${state.questions.length}`;
  }, [state]);

  function startTrack(track: InterviewTrack) {
    setStatus(null);
    startTransition(async () => {
      const res = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ track }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.message || data.error || "Could not start session");
        return;
      }
      setState({
        phase: "active",
        sessionId: data.sessionId,
        track,
        questions: data.questions,
        index: 0,
        answer: "",
        feedback: null,
      });
      setActivity((prev) => [
        { eventType: "session_start", createdAt: new Date().toISOString() },
        ...prev,
      ]);
    });
  }

  function submitAnswer() {
    if (state.phase !== "active") return;
    const question = state.questions[state.index];
    setStatus(null);
    startTransition(async () => {
      const res = await fetch("/api/practice/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          questionId: question.id,
          track: state.track,
          answer: state.answer,
          answeredCount: state.index + 1,
          totalQuestions: state.questions.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.message || data.error || "Could not save answer");
        return;
      }
      setActivity((prev) => [
        { eventType: "answer_submitted", createdAt: new Date().toISOString() },
        ...prev,
      ]);

      if (state.index + 1 >= state.questions.length) {
        await fetch("/api/practice/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: state.sessionId,
            track: state.track,
            answeredCount: state.questions.length,
          }),
        });
        setActivity((prev) => [
          { eventType: "session_complete", createdAt: new Date().toISOString() },
          ...prev,
        ]);
        setState({
          phase: "done",
          track: state.track,
          answeredCount: state.questions.length,
        });
        return;
      }

      setState({
        ...state,
        index: state.index + 1,
        answer: "",
        feedback: null,
      });
    });
  }

  function requestFeedback() {
    if (state.phase !== "active") return;
    const question = state.questions[state.index];
    setStatus(null);
    startTransition(async () => {
      const res = await fetch("/api/practice/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          questionId: question.id,
          answer: state.answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(
          data.message ||
            (data.error === "insufficient_paid_credits" || data.code === "INSUFFICIENT_PAID_CREDITS"
              ? "You're out of Ludwitt credits for third-party apps — top up at https://pitchrise.ludwitt.com/account/credits"
              : data.error || "Feedback failed"),
        );
        return;
      }
      setState({ ...state, feedback: data.feedback });
      setActivity((prev) => [
        { eventType: "feedback_requested", createdAt: new Date().toISOString() },
        ...prev,
      ]);
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loadError) {
    return (
      <main className="atmosphere flex min-h-screen items-center justify-center px-6">
        <div className="panel max-w-md p-8 text-center">
          <p className="mb-4 text-mist">{loadError}</p>
          <a href="/api/auth/login" className="btn-primary">
            Start practicing
          </a>
        </div>
      </main>
    );
  }

  if (!me) {
    return (
      <main className="atmosphere flex min-h-screen items-center justify-center">
        <p className="text-mist">Loading session…</p>
      </main>
    );
  }

  return (
    <main className="atmosphere min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/icon.png"
              alt="InterviewForge"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <div>
              <Link
                href="/"
                className="font-[family-name:var(--font-display)] text-2xl text-fog"
              >
                InterviewForge
              </Link>
              <p className="mt-1 text-sm text-mist">
                {me.user.name || me.user.email || me.user.sub}
                {me.credits
                  ? ` · ${me.credits.spendableFormatted} spendable`
                  : null}
              </p>
            </div>
          </div>
          <button type="button" onClick={logout} className="btn-ghost text-sm">
            Sign out
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="panel p-6 sm:p-8">
            {state.phase === "pick" ? (
              <>
                <h1
                  className="font-[family-name:var(--font-display)] text-3xl text-fog sm:text-4xl"
                  style={{ fontVariationSettings: '"SOFT" 40' }}
                >
                  Choose a drill
                </h1>
                <p className="mt-2 max-w-lg text-mist">
                  {me.demo
                    ? "Starting a track records a local session_start event (demo mode)."
                    : "Starting a track writes a session_start event to Ludwitt hosted data."}
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {TRACKS.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      className="track-tile"
                      disabled={pending}
                      onClick={() => startTrack(track.id)}
                    >
                      <span className="block text-lg font-semibold text-fog">
                        {track.title}
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-mist">
                        {track.blurb}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {state.phase === "active" ? (
              <>
                <div className="mb-6 flex items-center justify-between gap-3 text-sm text-mist">
                  <span className="uppercase tracking-[0.18em]">
                    {state.track.replace("-", " ")}
                  </span>
                  <span>{progress}</span>
                </div>
                <h2
                  className="font-[family-name:var(--font-display)] text-2xl leading-snug text-fog sm:text-3xl"
                  style={{ fontVariationSettings: '"SOFT" 35, "WONK" 20' }}
                >
                  {state.questions[state.index].prompt}
                </h2>
                <p className="mt-3 text-sm text-mist">
                  {state.questions[state.index].guidance}
                </p>
                <ul className="mt-4 space-y-1 text-sm text-mist/90">
                  {state.questions[state.index].samplePoints.map((point) => (
                    <li key={point}>· {point}</li>
                  ))}
                </ul>
                <textarea
                  className="mt-6 min-h-44 w-full resize-y rounded-md border border-[var(--line)] bg-ink-soft/80 p-4 text-fog outline-none ring-ember/40 focus:ring-2"
                  placeholder="Talk through your answer out loud, then write the outline here…"
                  value={state.answer}
                  onChange={(e) => setState({ ...state, answer: e.target.value })}
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={pending || state.answer.trim().length < 20}
                    onClick={submitAnswer}
                  >
                    Submit & continue
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={pending || state.answer.trim().length < 20}
                    onClick={requestFeedback}
                  >
                    AI coach feedback
                  </button>
                </div>
                {state.feedback ? (
                  <div className="mt-6 border border-[var(--line)] bg-ink/50 p-4 text-sm leading-relaxed text-fog">
                    {state.feedback}
                  </div>
                ) : null}
              </>
            ) : null}

            {state.phase === "done" ? (
              <div className="py-6">
                <h2
                  className="font-[family-name:var(--font-display)] text-3xl text-fog"
                  style={{ fontVariationSettings: '"SOFT" 40' }}
                >
                  Session complete
                </h2>
                <p className="mt-3 text-mist">
                  You answered {state.answeredCount} {state.track} prompts.
                  {me.demo
                    ? " A session_complete event was recorded locally."
                    : " A session_complete event is on Ludwitt."}
                </p>
                <button
                  type="button"
                  className="btn-primary mt-8"
                  onClick={() => setState({ phase: "pick" })}
                >
                  Start another drill
                </button>
              </div>
            ) : null}

            {status ? (
              <p className="mt-5 text-sm text-amber-200/90">{status}</p>
            ) : null}
          </section>

          <aside className="panel p-6">
            <h3 className="text-sm uppercase tracking-[0.18em] text-mist">
              {me.demo ? "Local events" : "Platform events"}
            </h3>
            <p className="mt-2 text-sm text-mist/80">
              {me.demo
                ? "Recent practice events stored in this app process."
                : "Recent writes to the Ludwitt events collection."}
            </p>
            <ul className="mt-5 space-y-3">
              {activity.length === 0 ? (
                <li className="text-sm text-mist">No events yet.</li>
              ) : (
                activity.map((event, idx) => (
                  <li
                    key={`${event.eventType}-${event.createdAt}-${idx}`}
                    className="border-b border-[var(--line)] pb-3 text-sm"
                  >
                    <span className="text-ember">{event.eventType}</span>
                    <span className="mt-1 block text-xs text-mist">
                      {event.createdAt
                        ? new Date(event.createdAt).toLocaleString()
                        : "just now"}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
