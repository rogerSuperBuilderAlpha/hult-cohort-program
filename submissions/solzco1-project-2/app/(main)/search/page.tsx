"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { searchMessages } from "@/app/actions";

type Result = {
  id: string;
  body: string;
  created_at: string;
  channel_id: string;
  channels: { name: string; slug: string | null; is_dm: boolean } | null;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="p-4">
      <h1 className="font-serif text-2xl">Search messages</h1>
      <p className="mt-1 text-sm text-ink/70">Keyword search across channels you can access.</p>
      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          startTransition(async () => {
            const r = await searchMessages(query);
            if (r.error) setError(r.error);
            setResults((r.results as Result[]) ?? []);
          });
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search keywords…"
          className="min-h-[44px] flex-1 rounded border border-moss/30 px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="min-h-[44px] rounded bg-moss px-4 py-2 text-paper"
        >
          Search
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      <ul className="mt-6 space-y-3">
        {results.map((r) => {
          const href = r.channels?.is_dm
            ? `/dm/${r.channel_id}`
            : `/channels/${r.channels?.slug ?? "general"}`;
          return (
            <li key={r.id} className="rounded border border-moss/20 bg-paper p-3">
              <Link href={href} className="text-sm font-medium text-moss">
                {r.channels?.name ?? "Channel"}
              </Link>
              <p className="mt-1 text-sm">{r.body}</p>
              <p className="mt-1 text-xs text-ink/60">
                {new Date(r.created_at).toLocaleString()}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
