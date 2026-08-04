"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setDemoUser } from "@/lib/demo-user";

function enterAs(
  router: ReturnType<typeof useRouter>,
  profile: { name: string; email: string }
) {
  setDemoUser(profile);
  router.push("/");
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
      email: email.trim() || "you@lighthouse.local",
      name: name.trim() || "Rawle Arneaud",
    });
  }

  function handleGuest() {
    setLoading("guest");
    enterAs(router, {
      name: "Guest Reviewer",
      email: "reviewer@lighthouse.demo",
    });
  }

  const inputClass =
    "mt-1.5 w-full border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 font-[family-name:var(--font-jetbrains)] text-sm text-[var(--ink)] outline-none transition focus:border-[var(--signal)] focus:bg-[var(--bg-elevated)]";

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block font-[family-name:var(--font-jetbrains)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
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
        <label className="block font-[family-name:var(--font-jetbrains)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-faint)]">
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
          className="w-full bg-[var(--signal)] px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--signal-ink)] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading === "sign-in" ? "Opening…" : "Enter Lighthouse"}
        </button>
      </form>

      <div className="relative flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--line)]" />
        <span className="font-[family-name:var(--font-jetbrains)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          or
        </span>
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <button
        type="button"
        disabled={loading !== null}
        onClick={handleGuest}
        className="w-full border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3 font-[family-name:var(--font-jetbrains)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:border-[var(--signal)] hover:text-[var(--signal)] disabled:opacity-60"
      >
        {loading === "guest"
          ? "Opening…"
          : "Continue as guest — no account needed"}
      </button>
      <p className="text-center font-[family-name:var(--font-jetbrains)] text-[11px] leading-relaxed text-[var(--ink-muted)]">
        Reviewers: use guest access to explore the full showcase without signing
        up. Public pages stay open — no credentials required.
      </p>
    </div>
  );
}
