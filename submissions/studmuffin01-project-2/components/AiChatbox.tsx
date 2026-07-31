"use client";

import { useEffect, useRef, useState } from "react";
import type { WorkspaceState } from "@/lib/types";
import { AI_SUGGESTED_PROMPTS, answerFlagQuery } from "@/lib/aiCoach";

type ChatTurn = { role: "user" | "assistant"; text: string };

type Props = {
  state: WorkspaceState;
  open: boolean;
  onClose: () => void;
};

export function AiChatbox({ state, open, onClose }: Props) {
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([
    {
      role: "assistant",
      text: "I watch message flags across Fireside — urgent, important, needs action, unread, and archived. Ask what needs follow-up.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, open]);

  if (!open) return null;

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const answer = answerFlagQuery(state, q);
    setTurns((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "assistant", text: answer },
    ]);
    setInput("");
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex max-h-[min(70vh,560px)] w-[min(100%-2rem,380px)] flex-col overflow-hidden border-[1.5px] border-[var(--line)] bg-[var(--surface-elevated)] shadow-[var(--shadow)] sm:right-6 sm:top-6">
      <header className="flex items-center justify-between border-b-[1.5px] border-[var(--line)] bg-[var(--accent)] px-4 py-3 text-[var(--sidebar-text)]">
        <div>
          <h2 className="font-[family-name:var(--font-source-serif)] text-sm font-semibold">
            Fireside AI
          </h2>
          <p className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] uppercase tracking-[0.12em] text-white/70">
            Flags → action, archive, unread
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="border border-white/30 px-2 py-1 font-[family-name:var(--font-ibm-plex-mono)] text-[10px] uppercase tracking-[0.1em] text-white/90 hover:bg-white/10"
        >
          Close
        </button>
      </header>

      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto px-3 py-3">
        {turns.map((turn, i) => (
          <div
            key={`${turn.role}-${i}`}
            className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
              turn.role === "user"
                ? "ml-6 bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "mr-4 bg-[var(--bg)] text-[var(--ink)]"
            }`}
          >
            {turn.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-[var(--line)] px-3 py-2">
        {AI_SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => ask(prompt)}
            className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2 border-t border-[var(--line)] p-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about flags…"
          className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-full bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
