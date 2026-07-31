"use client";

import { useState } from "react";
import {
  MAX_COMPANY_LEN,
  MAX_EMAIL_LEN,
  MAX_MESSAGE_LEN,
  MAX_NAME_LEN,
} from "@/lib/form-limits";
import { bumpLiveCounter } from "@/lib/live-counters";
import {
  PARTNER_INTEREST_OPTIONS,
  type PartnerInterest,
} from "@/lib/types";

export type IntroCandidate = {
  handle: string;
  name: string;
};

type Props = {
  candidates: IntroCandidate[];
  preselected?: string[];
};

export function RequestIntroForm({
  candidates,
  preselected = [],
}: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const form = new FormData(e.currentTarget);
    const studentHandles = form.getAll("students").map(String);
    const payload = {
      partnerName: String(form.get("partnerName") || ""),
      company: String(form.get("company") || ""),
      email: String(form.get("email") || ""),
      interest: String(form.get("interest") || "") as PartnerInterest,
      studentHandles,
      message: String(form.get("message") || ""),
    };

    try {
      const res = await fetch("/api/request-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Request failed");
      }
      bumpLiveCounter("introRequests");
      setStatus("ok");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Your name"
          name="partnerName"
          required
          maxLength={MAX_NAME_LEN}
        />
        <Field
          label="Company"
          name="company"
          required
          maxLength={MAX_COMPANY_LEN}
        />
      </div>
      <Field
        label="Work email"
        name="email"
        type="email"
        required
        maxLength={MAX_EMAIL_LEN}
      />

      <label className="flex flex-col gap-1.5 text-xs text-[var(--ink-muted)]">
        Type of interest
        <select
          name="interest"
          required
          defaultValue=""
          className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
        >
          <option value="" disabled>
            Select one…
          </option>
          {PARTNER_INTEREST_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} — {option.description}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="mb-2 text-xs text-[var(--ink-muted)]">
          Developers to meet
        </legend>
        <div className="grid max-h-48 gap-2 overflow-y-auto border border-[var(--line)] bg-[var(--bg)] p-3 sm:grid-cols-2">
          {candidates.map((person) => (
            <label
              key={person.handle}
              className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink)]"
            >
              <input
                type="checkbox"
                name="students"
                value={person.handle}
                defaultChecked={preselected.includes(person.handle)}
                className="accent-[var(--signal)]"
              />
              {person.name}
              <span className="text-[var(--ink-faint)]">@{person.handle}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5 text-xs text-[var(--ink-muted)]">
        Message
        <textarea
          name="message"
          required
          rows={4}
          maxLength={MAX_MESSAGE_LEN}
          placeholder="Roles, timeline, anything useful for the placement lead…"
          className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex h-11 items-center justify-center bg-[var(--signal)] px-5 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--signal-ink)] transition hover:brightness-110 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Request intro"}
      </button>
      {status === "ok" && (
        <p className="text-sm text-[var(--ok)]">
          Sent. Placement lead will follow up from the program inbox.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-[var(--danger)]">{error}</p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-[var(--ink-muted)]">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        className="border border-[var(--line-strong)] bg-[var(--bg)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--signal)]"
      />
    </label>
  );
}
