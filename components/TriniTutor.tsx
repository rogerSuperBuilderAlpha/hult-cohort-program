"use client";

import { useState } from "react";
import type { Question } from "@/lib/questions";

type TutorProps = {
  question: Question;
};

export function TriniTutor({ question }: TutorProps) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topUpUrl, setTopUpUrl] = useState<string | null>(null);
  const [charged, setCharged] = useState<string | null>(null);

  const askTutor = async () => {
    setLoading(true);
    setError(null);
    setTopUpUrl(null);
    setCharged(null);
    try {
      const res = await fetch("/api/ludwitt/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          answer: question.answer,
          explanation: question.explanation,
          category: question.category,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        text?: string;
        error?: string;
        code?: string;
        topUpUrl?: string;
        credits?: { chargedCostCents: number; newBalanceCents: number };
      };

      if (!res.ok || !data.ok) {
        setError(
          data.error ||
            "Tutor request failed. Sign in with Ludwitt and ensure you have paid credits.",
        );
        if (data.topUpUrl) setTopUpUrl(data.topUpUrl);
        return;
      }

      setText(data.text || "");
      if (data.credits) {
        setCharged(
          `Charged ${(data.credits.chargedCostCents / 100).toFixed(2)} · spendable now $${(data.credits.newBalanceCents / 100).toFixed(2)}`,
        );
      }
    } catch {
      setError("Network error talking to Ludwitt AI proxy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-left">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
          Trini Tutor (Ludwitt AI)
        </p>
        <button
          type="button"
          onClick={askTutor}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/90 text-gray-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Asking…" : text ? "Ask again" : "Ask tutor"}
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mb-2">
        Uses your Ludwitt paid credits via the AI proxy (BYOB · 70% engineer share).
      </p>
      {error && (
        <div className="text-xs text-red-300 space-y-1">
          <p>{error}</p>
          {topUpUrl && (
            <a
              href={topUpUrl}
              target="_blank"
              rel="noreferrer"
              className="underline text-amber-200"
            >
              Top up credits
            </a>
          )}
          {!topUpUrl && error.toLowerCase().includes("sign") && (
            <a href="/auth/login" className="underline text-amber-200 block">
              Sign in with Ludwitt
            </a>
          )}
        </div>
      )}
      {text && (
        <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      )}
      {charged && (
        <p className="mt-2 text-[11px] text-emerald-300/90">{charged}</p>
      )}
    </div>
  );
}
