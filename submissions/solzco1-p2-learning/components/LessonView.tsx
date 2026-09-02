"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lesson } from "@/lib/lessons";
import { SalesCoach } from "@/components/SalesCoach";
export function LessonView({ lesson }: { lesson: Lesson }) {
  const [completed, setCompleted] = useState(false);
  const [eventStatus, setEventStatus] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "lesson_started",
        metadata: { lesson_id: lesson.id, title: lesson.title },
      }),
    }).then(async (r) => {
      const data = (await r.json()) as { ok?: boolean; channel?: string };
      if (data.ok) setEventStatus(`Event recorded (${data.channel})`);
    });
  }, [lesson.id, lesson.title]);

  async function markComplete() {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "lesson_completed",
        metadata: { lesson_id: lesson.id, title: lesson.title },
      }),
    });
    const data = (await res.json()) as { ok?: boolean; channel?: string };
    if (data.ok) {
      setCompleted(true);
      setEventStatus(`Completed · event (${data.channel})`);
    }
  }

  return (
    <article>
      <Link href="/learn" className="text-sm text-forge-copper">
        ← Back to curriculum
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">{lesson.title}</h1>
      <p className="mt-1 text-sm text-forge-muted">{lesson.durationMin} min read</p>

      <div className="prose prose-sm mt-8 max-w-none space-y-4 text-forge-slate">
        {lesson.body.map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
      </div>

      <div className="mt-8 rounded border border-forge-gold/30 bg-forge-gold/5 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-forge-gold">
          Key takeaways
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {lesson.keyTakeaways.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={() => void markComplete()}
          disabled={completed}
          className="rounded bg-forge-ink px-5 py-2.5 text-sm font-medium text-forge-paper disabled:opacity-50 hover:bg-forge-slate"
        >
          {completed ? "Lesson completed ✓" : "Mark lesson complete"}
        </button>
        {eventStatus ? (
          <span className="text-xs text-forge-muted">{eventStatus}</span>
        ) : null}
      </div>

      <SalesCoach lessonId={lesson.id} />
    </article>
  );
}
