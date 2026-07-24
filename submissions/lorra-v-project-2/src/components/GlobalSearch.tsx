"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      data-testid="global-search"
      className="min-w-0 flex-1 max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        const next = q.trim();
        if (next.length < 2) return;
        router.push(`/search?q=${encodeURIComponent(next)}`);
      }}
    >
      <label className="sr-only" htmlFor="global-search-input">
        Search messages
      </label>
      <input
        id="global-search-input"
        data-testid="global-search-input"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search messages…"
        className="w-full rounded-[var(--radius-input)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] bg-[var(--color-bg)] px-3 py-1.5 text-sm text-[var(--color-dark)] placeholder:text-[var(--color-secondary)]"
      />
    </form>
  );
}
