"use client";

import { useState } from "react";
import {
  MAX_COMPANY_LEN,
  MAX_EMAIL_LEN,
  MAX_NAME_LEN,
} from "@/lib/form-limits";
import { bumpLiveCounter } from "@/lib/live-counters";

export function RsvpForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      company: String(form.get("company") || ""),
      attending: String(form.get("attending") || "yes"),
    };

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "RSVP failed");
      }
      bumpLiveCounter("rsvps");
      setStatus("ok");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "RSVP failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="flex flex-col gap-1.5 text-xs text-[var(--ink-muted)]">
        Name
        <input
          name="name"
          required
          maxLength={MAX_NAME_LEN}
          className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs text-[var(--ink-muted)]">
        Email
        <input
          name="email"
          type="email"
          required
          maxLength={MAX_EMAIL_LEN}
          className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs text-[var(--ink-muted)]">
        Company (optional)
        <input
          name="company"
          maxLength={MAX_COMPANY_LEN}
          className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs text-[var(--ink-muted)]">
        Attendance
        <select
          name="attending"
          defaultValue="yes"
          className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
        >
          <option value="yes">Yes — count me in</option>
          <option value="maybe">Maybe</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-11 items-center justify-center bg-[var(--signal)] px-5 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--signal-ink)] transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Submit RSVP"}
      </button>
      {status === "ok" && (
        <p className="text-sm text-[var(--ok)]">RSVP recorded. See you there.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      )}
    </form>
  );
}
