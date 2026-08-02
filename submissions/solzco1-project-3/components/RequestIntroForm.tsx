"use client";

import { useState } from "react";
import type { Builder } from "@/lib/types";
import { PARTNER_INTEREST_OPTIONS } from "@/lib/types";
import { publicBuilders } from "@/lib/roster";

export function RequestIntroForm({
  preselected,
}: {
  preselected?: string[];
}) {
  const [partnerName, setPartnerName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState(PARTNER_INTEREST_OPTIONS[0]!.value);
  const [message, setMessage] = useState("");
  const [handles, setHandles] = useState<string[]>(preselected ?? []);
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState("");

  const builders = publicBuilders();

  function toggleHandle(h: string) {
    setHandles((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("idle");
    setErrMsg("");
    try {
      const res = await fetch("/api/request-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName,
          company,
          email,
          interest,
          studentHandles: handles,
          message,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("err");
        setErrMsg(data.error ?? "Request failed");
        return;
      }
      setStatus("ok");
    } catch {
      setStatus("err");
      setErrMsg("Network error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-6">
      <h2 className="font-display text-xl font-bold">Request intro</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Your name
          <input
            required
            value={partnerName}
            onChange={(e) => setPartnerName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--glass-border)] bg-transparent px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Company
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--glass-border)] bg-transparent px-3 py-2"
          />
        </label>
      </div>
      <label className="block text-sm">
        Work email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--glass-border)] bg-transparent px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Interest
        <select
          value={interest}
          onChange={(e) =>
            setInterest(e.target.value as typeof interest)
          }
          className="mt-1 w-full rounded-lg border border-[var(--glass-border)] bg-transparent px-3 py-2"
        >
          {PARTNER_INTEREST_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} — {o.description}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="text-sm font-medium">Builders (select one or more)</legend>
        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[var(--glass-border)] p-2">
          {builders.map((b: Builder) => (
            <label
              key={b.handle}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-white/5"
            >
              <input
                type="checkbox"
                checked={handles.includes(b.handle)}
                onChange={() => toggleHandle(b.handle)}
              />
              @{b.handle}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm">
        Message
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--glass-border)] bg-transparent px-3 py-2"
        />
      </label>
      <button type="submit" className="btn-primary w-full">
        Submit to placement lead
      </button>
      {status === "ok" && (
        <p className="text-sm text-[var(--accent-2)]">
          Received — we will follow up within one business day.
        </p>
      )}
      {status === "err" && (
        <p className="text-sm text-red-400">{errMsg}</p>
      )}
    </form>
  );
}
