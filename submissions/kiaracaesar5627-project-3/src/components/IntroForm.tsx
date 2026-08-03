"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { SuccessBurst } from "@/components/SuccessBurst";

export function IntroForm({
  handles,
  skillMap,
}: {
  handles: string[];
  skillMap: Record<string, string[]>;
}) {
  const search = useSearchParams();
  const preselected = useMemo(() => {
    const student = search.get("student");
    return student && handles.includes(student) ? student : null;
  }, [search, handles]);
  const [picked, setPicked] = useState<string[]>(
    preselected ? [preselected] : [],
  );
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const coverage = useMemo(() => {
    const set = new Set<string>();
    for (const h of picked) {
      for (const s of skillMap[h] || []) set.add(s);
    }
    const all = new Set(Object.values(skillMap).flat());
    const pct = all.size === 0 ? 0 : Math.round((set.size / all.size) * 100);
    return { skills: Array.from(set).sort(), pct, count: set.size };
  }, [picked, skillMap]);

  function toggle(handle: string) {
    setPicked((prev) =>
      prev.includes(handle)
        ? prev.filter((h) => h !== handle)
        : [...prev, handle],
    );
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (picked.length === 0) {
      setStatus("Pick at least one student chip.");
      return;
    }
    startTransition(async () => {
      setStatus(null);
      const res = await fetch("/api/intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName: String(data.get("partnerName") || ""),
          company: String(data.get("company") || ""),
          email: String(data.get("email") || ""),
          studentHandles: picked,
          message: String(data.get("message") || ""),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setStatus(json.error || "Could not send intro request.");
        return;
      }
      form.reset();
      setPicked([]);
      setStatus("Sent. Placement lead notified — expect a reply within 24 hours.");
    });
  }

  const success = status?.startsWith("Sent");

  return (
    <form id="intro-form" onSubmit={onSubmit} className="fun-form grid max-w-xl gap-4">
      <div className="shortlist-meter">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--fog)]">
            Shortlist coverage
          </p>
          <p className="font-display text-lg tabular-nums text-[var(--signal)]">
            {coverage.pct}%
          </p>
        </div>
        <div className="progress-track mt-2">
          <div className="progress-fill" style={{ width: `${coverage.pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-[var(--fog)]">
          {picked.length} student{picked.length === 1 ? "" : "s"} · {coverage.count}{" "}
          unique skills
          {coverage.skills.length
            ? ` · ${coverage.skills.slice(0, 5).join(", ")}${coverage.skills.length > 5 ? "…" : ""}`
            : ""}
        </p>
      </div>

      <div className="field">
        <label htmlFor="partnerName">Your name</label>
        <input id="partnerName" name="partnerName" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" required autoComplete="organization" />
      </div>
      <div className="field">
        <label htmlFor="email">Work email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-[var(--fog)]">
          Students to meet · {picked.length} selected
        </p>
        <div className="student-chip-grid">
          {handles.map((handle) => {
            const on = picked.includes(handle);
            return (
              <button
                key={handle}
                type="button"
                className={`student-chip ${on ? "is-on" : ""}`}
                aria-pressed={on}
                onClick={() => toggle(handle)}
              >
                @{handle}
              </button>
            );
          })}
        </div>
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={5} required />
      </div>
      <button
        className="btn btn-primary btn-bounce w-fit"
        disabled={pending}
        type="submit"
      >
        {pending ? "Sending…" : "Request intro"}
      </button>
      {success && status ? <SuccessBurst message={status} /> : null}
      {status && !success ? (
        <p className="text-sm text-[var(--ember)]" role="status">
          {status}
        </p>
      ) : null}
    </form>
  );
}
