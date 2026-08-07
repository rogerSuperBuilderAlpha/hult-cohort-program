'use client';

import { useEffect, useRef, useState } from 'react';
import { useAskPulse } from '@/lib/use-ask-pulse';
import { pollInbox, sendDispatch } from '@/lib/shared-context-client';
import { appendTurn, subscribeToThread, type Turn } from '@/lib/ask-thread';
import type { ExtractionResult } from '@/app/api/extract-recipe/route';
import { RecipeModal, type RecipeDraft } from '@/components/RecipeModal';
import type { Member, Project, Task } from '@/lib/types';

type Actor = { uid: string; name: string; photoURL: string | null };

const THIN_NOTE = 'Not enough in the evidence to draft from. Tell it in your words.';

/**
 * The Pulse agent panel — a persistent workspace, not a one-shot box. design-agent.md.
 *
 * You give it a command or a question; it does the work or answers, and every exchange stays
 * in a threaded transcript that PERSISTS per user (lib/ask-thread), so the panel remembers
 * your context across visits and the planner gets recent turns as context. Own-board actions
 * run seamlessly with a quiet undo on the current turn; the register follows VOICE (plain,
 * verb-first, no exclamation, no emoji).
 *
 * The current turn shows live (thinking → steps + undo → answer). It's archived into the
 * transcript on the NEXT send (or on unmount) — never both live AND in history at once, so a
 * step never renders twice.
 */
export function AskPulse({
  actor,
  tasks,
  projects,
  members,
  ready,
  canPublish,
}: {
  actor: Actor;
  tasks: Task[];
  projects: Project[];
  members: Member[];
  ready: boolean;
  canPublish: boolean;
}) {
  const [pendingRecipe, setPendingRecipe] = useState<{ taskId: string; title: string } | null>(null);
  const [recipeDraft, setRecipeDraft] = useState<RecipeDraft | null>(null);
  // A cross-app hand-off the agent proposed — held here until the user confirms; it NEVER sends
  // on its own (the model has no authority; the user confirms every cross-app send).
  const [pendingDispatch, setPendingDispatch] = useState<{ toApp: string; intent: string } | null>(null);
  const [dispatchNote, setDispatchNote] = useState<string | null>(null);
  const { phase, steps, note, answer, run, undoStep } = useAskPulse({
    actor,
    tasks,
    projects,
    canPublish,
    onDraftRecipe: (taskId, title) => setPendingRecipe({ taskId, title }),
    onProposeDispatch: (toApp, intent) => {
      setDispatchNote(null);
      setPendingDispatch({ toApp, intent });
    },
  });

  // Poll Pulse's inbox once when the panel opens: run any cross-app requests another app addressed
  // to Pulse for this user. Best-effort and silent — inert until the shared bus is configured.
  useEffect(() => {
    void pollInbox();
  }, []);
  const [text, setText] = useState('');

  // The persisted transcript — the agent's memory, yours alone (firestore.rules).
  const [turns, setTurns] = useState<Turn[]>([]);
  useEffect(() => subscribeToThread(actor.uid, setTurns), [actor.uid]);

  // Every turn is persisted immediately (so nothing is lost on navigate-away). The current
  // turn's Pulse reply is hidden from the transcript by its doc id while its LIVE view (steps
  // + undo, or the answer) is showing — so a step never renders twice. On reload the id is
  // gone, so the whole transcript shows.
  const [hiddenPulseId, setHiddenPulseId] = useState<string | null>(null);

  // Recipe draft flow — unchanged. When the agent proposes a recipe, fetch a draft from the
  // shipped task's PR, then open the modal (peer-name gate + require-one-edit live there).
  useEffect(() => {
    if (!pendingRecipe) return;
    let cancelled = false;
    const task = tasks.find((t) => t.id === pendingRecipe.taskId);
    const prNumber = task?.evidence?.prNumbers?.[0] ?? null;
    (async () => {
      let result: ExtractionResult | null = null;
      if (prNumber !== null) {
        try {
          const res = await fetch('/api/extract-recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prNumber, prTitle: pendingRecipe.title }),
          });
          if (res.ok) result = (await res.json()) as ExtractionResult;
        } catch {
          result = null;
        }
      }
      if (cancelled) return;
      setRecipeDraft(
        result && !result.thin
          ? { problem: result.problem, body: result.body, taskId: pendingRecipe.taskId }
          : { problem: '', body: '', taskId: pendingRecipe.taskId, note: THIN_NOTE }
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingRecipe, tasks]);

  const closeRecipe = () => {
    setRecipeDraft(null);
    setPendingRecipe(null);
  };

  const busy = phase === 'planning' || phase === 'running';
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // A "why nothing happened" line — every early return from submit() leaves a word behind.
  const [hint, setHint] = useState<string | null>(null);

  // Keep the newest turn in view as the thread grows — but scroll ONLY the transcript container,
  // never the page. scrollIntoView() used to bubble up and yank the whole window (and the sticky
  // rail), so the user couldn't freely scroll; scoping it to this element keeps the page still.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length, steps.length, answer, phase]);

  const submit = () => {
    const utterance = text.trim();
    if (busy) return; // the spinner is already the feedback
    if (!utterance) {
      setHint('Tell me what to do — like “add a task to fix the login bug”.');
      inputRef.current?.focus();
      return;
    }
    if (!ready) {
      setHint('One second — I’m still reading your board. Try that again in a moment.');
      return;
    }
    setHint(null);
    setText('');

    // The previous turn's Pulse reply becomes plain history now.
    setHiddenPulseId(null);
    // Recent transcript is the planner's context (memory).
    const history = turns.map((t) => ({ role: t.role, text: t.text }));

    // Persist the command, run it (which clears the live view), then persist + hide the reply.
    void appendTurn(actor.uid, 'you', utterance);
    void run(utterance, history).then(async (summary) => {
      const pulseId = await appendTurn(actor.uid, 'pulse', summary);
      if (pulseId) setHiddenPulseId(pulseId);
    });
  };

  const startWith = (prefill: string) => {
    setHint(null);
    setText(prefill);
    const el = inputRef.current;
    if (el) {
      el.focus();
      requestAnimationFrame(() => el.setSelectionRange(prefill.length, prefill.length));
    }
  };

  const visibleTurns = turns.filter((t) => t.id !== hiddenPulseId);
  const showEmpty = visibleTurns.length === 0 && phase === 'idle';

  return (
    <>
      {/* On desktop the panel is capped to the viewport (it lives in a sticky rail) so the composer
          and newest reply are always reachable and the transcript scrolls WITHIN the panel, not the
          page. On mobile it sits in normal flow and grows naturally. */}
      <section className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 lg:max-h-[calc(100vh-3rem)]">
        {/* Panel header — Pulse's own workspace. */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-3">
          <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.15)]" />
          <span className="text-sm font-medium text-zinc-100">Pulse</span>
          <span className="text-xs text-zinc-500">agent</span>
          <span className="flex-1" />
          <span className="text-xs text-zinc-600">remembers your context</span>
        </div>

        {/* A proposed cross-app hand-off, waiting on the user. Sending it is the user's call —
            Pulse drafts, the user confirms (the same posture as everywhere else in the product). */}
        {pendingDispatch && (
          <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs">
            <span className="text-zinc-300">
              Ask {pendingDispatch.toApp}: “{pendingDispatch.intent}”?
            </span>
            <span className="flex-1" />
            <button
              onClick={async () => {
                const { toApp, intent } = pendingDispatch;
                setPendingDispatch(null);
                const res = await sendDispatch(toApp, intent);
                setDispatchNote(res.ok ? `Sent to ${toApp}.` : `Couldn’t reach ${toApp} right now.`);
              }}
              className="rounded-md border border-emerald-600/50 px-2 py-1 text-emerald-300 transition-colors hover:bg-emerald-600/10"
            >
              Send
            </button>
            <button
              onClick={() => {
                setPendingDispatch(null);
                setDispatchNote('Left it here.');
              }}
              className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-400 transition-colors hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>
        )}
        {dispatchNote && !pendingDispatch && (
          <div className="border-b border-zinc-800 px-4 py-2 text-xs text-zinc-500">{dispatchNote}</div>
        )}

        {/* The transcript — persisted history, then the live current turn. It is the only scroller:
            capped on mobile, and flex-filling the capped panel on desktop (min-h-0 lets it shrink so
            overflow scrolls here instead of pushing the composer off-screen). */}
        <div
          ref={scrollRef}
          className="flex max-h-[62vh] min-h-[200px] flex-col gap-4 overflow-y-auto px-4 py-4 lg:max-h-none lg:min-h-0 lg:flex-1"
        >
          {showEmpty && (
            <p className="text-sm text-zinc-500">
              Tell Pulse what to do — “move the login card to done”, “start a project called Marketing” —
              or ask, like “what should I focus on?”. It remembers what you’ve asked before.
            </p>
          )}

          {visibleTurns.map((t) =>
            t.role === 'you' ? (
              <div key={t.id} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100">
                {t.text}
              </div>
            ) : (
              <div key={t.id} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-emerald-950">
                  P
                </span>
                <p className="flex-1 text-sm leading-snug text-zinc-300">{t.text}</p>
              </div>
            )
          )}

          {/* Thinking. */}
          {phase === 'planning' && (
            <div className="pulse-row-in flex items-center gap-2.5">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
              <span className="text-sm text-zinc-400">Pulse is working out what you need…</span>
            </div>
          )}

          {/* Live steps + undo (current turn). */}
          {(phase === 'running' || phase === 'done') && steps.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-zinc-500">
                {phase === 'running'
                  ? `on it — ${steps.filter((s) => s.state !== 'running').length} of ${steps.length} done`
                  : 'done'}
              </p>
              <div className="flex flex-col gap-1.5">
                {steps.map((s) => (
                  <div key={s.id} className="pulse-row-in flex items-center gap-3 rounded-lg bg-zinc-800/60 px-3 py-2 text-sm">
                    <span aria-hidden className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {s.state === 'running' ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-zinc-700 border-t-emerald-400 motion-safe:animate-spin" />
                      ) : s.state === 'undone' ? (
                        <span className="text-zinc-600">—</span>
                      ) : (
                        <span className="text-emerald-400">✓</span>
                      )}
                    </span>
                    <span className={`flex-1 ${s.state === 'undone' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                      {s.label}
                      {s.detail && <span className="text-zinc-500"> · {s.detail}</span>}
                    </span>
                    {s.undo && s.state === 'done' && (
                      <button
                        onClick={() => void undoStep(s.id)}
                        className="min-h-11 text-xs text-zinc-400 underline underline-offset-2 hover:text-zinc-300"
                      >
                        undo
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer (current turn). */}
          {phase === 'answered' && answer && (
            <div className="pulse-row-in flex items-start gap-2.5">
              <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-emerald-950">
                P
              </span>
              <p className="flex-1 text-sm leading-snug text-zinc-100">{answer}</p>
            </div>
          )}

          {/* Couldn't-plan / nothing-to-do. */}
          {phase === 'degraded' && note && (
            <div className="pulse-row-in rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-300">{note}</div>
          )}

          {hint && phase !== 'planning' && phase !== 'running' && (
            <p className="pulse-row-in text-xs text-zinc-400">{hint}</p>
          )}
        </div>

        {/* Composer. */}
        <div className="border-t border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 py-1 pl-4 pr-1">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (hint) setHint(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              disabled={busy}
              placeholder="tell Pulse what to do — make a task, move a card, start a project"
              aria-label="Ask Pulse to do something on your board"
              className="min-h-11 flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none disabled:opacity-60"
            />
            <button
              onClick={submit}
              disabled={busy || text.trim().length === 0}
              className="min-h-9 rounded-full bg-emerald-500 px-3 text-sm font-medium text-emerald-950 transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {busy ? 'working…' : 'send'}
            </button>
          </div>

          {!ready && phase === 'idle' && !hint && <p className="mt-2 text-xs text-zinc-500">Reading your board…</p>}

          {phase === 'idle' && (
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  ['plan my week', 'plan my week'],
                  ['add a task', 'add a task to '],
                  ['move a card', 'move '],
                ] as const
              ).map(([label, prefill]) => (
                <button
                  key={label}
                  onClick={() => startWith(prefill)}
                  className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {recipeDraft && (
        <RecipeModal actor={actor} draft={recipeDraft} members={members} requireEdit onClose={closeRecipe} onCreated={closeRecipe} />
      )}
    </>
  );
}
