"use client";

import { useState } from "react";

export function SalesCoach({ lessonId }: { lessonId?: string }) {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, lessonId }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Coach unavailable");
      } else {
        setAnswer(data.answer ?? "");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 rounded-lg border border-forge-slate/20 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-forge-copper">
        AI sales coach (Ludwitt credits)
      </h2>
      <p className="mt-1 text-xs text-forge-muted">
        Ask a scenario question — powered by Ludwitt&apos;s AI proxy (paid credits
        only).
      </p>
      <textarea
        className="mt-3 w-full rounded border border-forge-slate/20 p-3 text-sm"
        rows={3}
        placeholder="e.g. Procurement wants 30% off before legal review — how do I respond?"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        type="button"
        onClick={() => void ask()}
        disabled={loading || !prompt.trim()}
        className="mt-2 rounded bg-forge-copper px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-forge-gold hover:text-forge-ink"
      >
        {loading ? "Thinking…" : "Ask coach"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {answer ? (
        <div className="mt-3 rounded bg-forge-paper p-3 text-sm text-forge-slate">
          {answer}
        </div>
      ) : null}
    </div>
  );
}
