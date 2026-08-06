"use client";

import Link from "next/link";
import { useState } from "react";

const STORAGE_KEY = "ai-onramp-progress";

export type ProgressLesson = { slug: string; title: string };
export type ProgressModule = { slug: string; title: string; tagline: string; lessons: ProgressLesson[] };

export function loadCompleted(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveCompleted(completed: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  } catch {
    /* ignore quota / private mode errors */
  }
}

async function fireEvent(name: string, properties: Record<string, string | number | boolean | null>) {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, properties }),
    });
  } catch {
    /* best-effort analytics */
  }
}

function percent(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

export function DashboardProgress({ modules }: { modules: ProgressModule[] }) {
  const [completed, setCompleted] = useState<string[] | null>(null);

  if (completed === null) {
    setCompleted(loadCompleted());
  }

  if (!completed) return null;

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedSet = new Set(completed);
  const doneCount = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => completedSet.has(l.slug)).length,
    0
  );

  const nextLesson = (() => {
    for (const m of modules) {
      for (const l of m.lessons) {
        if (!completedSet.has(l.slug)) {
          return { module: m.slug, lesson: l.slug };
        }
      }
    }
    return null;
  })();

  return (
    <div className="space-y-6">
      {nextLesson && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-accent/5 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Up next
            </p>
            <p className="mt-1 text-sm text-muted">
              {doneCount}/{totalLessons} lessons complete · keep the streak going
            </p>
          </div>
          <Link
            href={`/learn/${nextLesson.module}/${nextLesson.lesson}`}
            className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-background transition hover:brightness-110"
          >
            Continue learning →
          </Link>
        </div>
      )}

      {modules.map((m, i) => {
        const done = m.lessons.filter((l) => completedSet.has(l.slug)).length;
        const pct = percent(done, m.lessons.length);
        return (
          <div key={m.slug} className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-muted mb-1">
                  Module {i + 1} of {modules.length}
                </p>
                <h2 className="text-xl font-semibold">{m.title}</h2>
              </div>
              <p className="text-sm tabular-nums text-muted">
                {done}/{m.lessons.length} · {pct}%
              </p>
            </div>
            <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-sm text-muted mb-4">{m.tagline}</p>
            <ul className="space-y-2">
              {m.lessons.map((l, li) => {
                const isDone = completedSet.has(l.slug);
                return (
                  <li key={l.slug}>
                    <Link
                      href={`/learn/${m.slug}/${l.slug}`}
                      className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm transition hover:border-accent/60"
                    >
                      <span
                        aria-hidden
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                          isDone
                            ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-600"
                            : "border-border text-muted"
                        }`}
                      >
                        {isDone ? "✓" : `${i + 1}.${li + 1}`}
                      </span>
                      <span className={isDone ? "text-muted line-through decoration-muted/40" : ""}>
                        {l.title}
                      </span>
                      {isDone && <span className="ml-auto text-xs text-emerald-600">done</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function LessonCompleteButton({
  lessonSlug,
  moduleSlug,
  nextHref,
}: {
  lessonSlug: string;
  moduleSlug: string;
  nextHref: string | null;
}) {
  const [done, setDone] = useState<boolean | null>(null);

  if (done === null) {
    setDone(loadCompleted().includes(lessonSlug));
  }

  if (done === null) return null;

  async function toggle() {
    if (done) {
      const next = loadCompleted().filter((s) => s !== lessonSlug);
      saveCompleted(next);
      setDone(false);
      return;
    }
    const next = Array.from(new Set([...loadCompleted(), lessonSlug]));
    saveCompleted(next);
    setDone(true);
    fireEvent("lesson_completed", { lesson: lessonSlug, module: moduleSlug });
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold transition ${
          done
            ? "border border-emerald-500/60 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
            : "bg-accent text-background hover:brightness-110"
        }`}
      >
        {done ? "✓ Marked complete" : "Mark lesson as complete"}
      </button>
      {done && nextHref && (
        <Link
          href={nextHref}
          className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-background transition hover:brightness-110"
        >
          Next lesson →
        </Link>
      )}
    </div>
  );
}