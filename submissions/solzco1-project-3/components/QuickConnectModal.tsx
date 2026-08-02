"use client";

import { useEffect, useState } from "react";
import type { Builder } from "@/lib/types";
import { URLS } from "@/lib/config";

type Props = {
  builder: Builder;
  open: boolean;
  onClose: () => void;
};

export function QuickConnectModal({ builder, open, onClose }: Props) {
  const [tab, setTab] = useState<"resume" | "calendly" | "sandbox">("resume");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSent(false);
      setMessage("");
      setEmail("");
    }
  }, [open]);

  if (!open) return null;

  async function submit(type: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/request-intro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName: "Quick Connect",
          company: "Partner (via Quick Connect)",
          email: email || "partner@example.com",
          interest: type === "sandbox" ? "sandbox-review" : "hire",
          studentHandles: [builder.handle],
          message:
            message ||
            `Quick Connect request (${tab}) for @${builder.handle}`,
          inquiryType: type,
        }),
      });
      if (res.ok) setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="quick-connect-title"
    >
      <div className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="quick-connect-title" className="font-display text-xl font-bold">
              Quick Connect
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              @{builder.handle} · {builder.signatureProject}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-muted)] hover:text-[var(--ink)]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex gap-2 border-b border-[var(--glass-border)] pb-3">
          {(
            [
              ["resume", "Request resume"],
              ["calendly", "Book 15 min"],
              ["sandbox", "Sandbox review"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                tab === id
                  ? "bg-[var(--accent)] text-[var(--bg)]"
                  : "text-[var(--ink-muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {sent ? (
          <p className="mt-6 text-[var(--accent-2)]">
            Request logged — placement lead notified.
          </p>
        ) : tab === "calendly" ? (
          <div className="mt-4">
            <p className="mb-3 text-sm text-[var(--ink-muted)]">
              Book a 15-minute intro with the cohort placement team.
            </p>
            <a
              href={URLS.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Open Calendly
            </a>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              Your email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--glass-border)] bg-transparent px-3 py-2 text-sm"
                placeholder="you@company.com"
              />
            </label>
            <label className="block text-sm">
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[var(--glass-border)] bg-transparent px-3 py-2 text-sm"
                placeholder={
                  tab === "sandbox"
                    ? "Scope for sandbox code review…"
                    : "What role or project are you exploring?"
                }
              />
            </label>
            <button
              type="button"
              disabled={loading}
              onClick={() => submit(tab)}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send request"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
