"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setDemoUser } from "@/lib/demo-user";

function enterAs(
  router: ReturnType<typeof useRouter>,
  profile: { name: string; email: string }
) {
  setDemoUser(profile);
  router.push("/workspace");
}

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<"sign-in" | "guest" | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading("sign-in");
    enterAs(router, {
      email: email.trim() || "you@fireside.local",
      name: name.trim() || "Rawle Arneaud",
    });
  }

  function handleGuest() {
    setLoading("guest");
    enterAs(router, {
      name: "Guest Reviewer",
      email: "reviewer@fireside.demo",
    });
  }

  const inputClass =
    "mt-1.5 w-full border-[1.5px] border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 font-[family-name:var(--font-ibm-plex-mono)] text-sm text-[var(--ink)] outline-none focus:bg-[var(--surface)]";

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
          Display name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputClass}
            autoComplete="name"
          />
        </label>
        <label className="block font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@hult.edu"
            className={inputClass}
            autoComplete="email"
          />
        </label>
        <button
          type="submit"
          disabled={loading !== null}
          className="forth-btn w-full bg-[var(--accent)] px-4 py-3 text-[var(--sidebar-text)]"
        >
          {loading === "sign-in" ? "Opening…" : "Enter Fireside"}
        </button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--line)]/40" />
        <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          or
        </span>
        <div className="h-px flex-1 bg-[var(--line)]/40" />
      </div>

      <button
        type="button"
        disabled={loading !== null}
        onClick={handleGuest}
        className="forth-btn w-full bg-[var(--olive-soft)] px-4 py-3 text-[var(--ink)]"
      >
        {loading === "guest"
          ? "Opening…"
          : "Continue as guest — no account needed"}
      </button>
      <p className="text-center font-[family-name:var(--font-ibm-plex-mono)] text-[11px] leading-relaxed text-[var(--ink-muted)]">
        Reviewers: use guest access to explore the full workspace without
        signing in. Demo data stays in your browser.
      </p>
    </div>
  );
}
