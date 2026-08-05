"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { track } from "@/components/SessionHeartbeat";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "I’m applying for a mid-level software engineer role at a Series B SaaS company. Behavioral rounds scare me.",
  "Target role: product manager. I freeze when Sales and Eng disagree.",
  "Mock me for a customer success churn-risk conversation.",
  "I’m a career-switcher into data analytics — where should I start?",
];

function renderContent(text: string) {
  const parts = text.split(/(\/practice\/[a-z0-9-]+(?:\/[a-z0-9-]+)?)/g);
  return parts.map((part, i) => {
    if (part.startsWith("/practice/")) {
      return (
        <Link key={`${part}-${i}`} href={part} className="coach-path">
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function CoachChat({ canTrack }: { canTrack: boolean }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "I’m your interview coach. Tell me the job you’re applying for, your level, and what feels hardest — I’ll personalize a practice path from Interview Room’s scenarios.",
    },
  ]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [tracked, setTracked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const nextMessages: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);

    startTransition(async () => {
      if (canTrack && !tracked) {
        setTracked(true);
        void track("lesson_started", { lesson_id: "coach", surface: "ai_chat" });
      }

      try {
        const res = await fetch("/api/coach/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages.filter((m) => m.role === "user" || m.role === "assistant").slice(-20),
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          reply?: string;
          mode?: string;
          notice?: string;
          error?: string;
        };
        if (!res.ok || !data.reply) {
          setError(data.error || "Coach unavailable — try again.");
          return;
        }
        setMode(data.mode ?? null);
        setNotice(data.notice ?? null);
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
      } catch {
        setError("Network error talking to the coach.");
      }
    });
  }

  return (
    <div className="coach">
      <header className="coach-head">
        <p className="eyebrow">Personalization</p>
        <h1>Interview coach</h1>
        <p className="support">
          Chat about your application — get scenario links, mock prompts, and STAR
          feedback tailored to you.
        </p>
        {mode ? (
          <p className="coach-mode">
            Mode: {mode === "local" ? "built-in coach" : mode}
            {notice ? ` · ${notice}` : null}
          </p>
        ) : null}
      </header>

      <div className="coach-starters" aria-label="Suggested prompts">
        {STARTERS.map((s) => (
          <button key={s} type="button" className="coach-chip" disabled={pending} onClick={() => send(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="coach-thread" role="log" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "coach-bubble user" : "coach-bubble assistant"}>
            <p className="meta">{m.role === "user" ? "You" : "Coach"}</p>
            <div className="coach-text">{renderContent(m.content)}</div>
          </div>
        ))}
        {pending ? (
          <div className="coach-bubble assistant">
            <p className="meta">Coach</p>
            <p className="coach-typing">Personalizing…</p>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {error ? <p className="feedback bad">{error}</p> : null}

      <form
        className="coach-compose"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label className="sr-only" htmlFor="coach-input">
          Message the coach
        </label>
        <textarea
          id="coach-input"
          rows={3}
          value={input}
          disabled={pending}
          placeholder="e.g. Mid-level UX designer, fintech, struggle with stakeholder pushback…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
        />
        <button type="submit" className="btn primary" disabled={pending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
