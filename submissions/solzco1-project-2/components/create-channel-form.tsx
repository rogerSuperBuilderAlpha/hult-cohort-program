"use client";

import { useState, useTransition } from "react";
import { createChannel } from "@/app/actions";

export function CreateChannelForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex flex-wrap items-center gap-2 border-b border-moss/15 px-4 py-2 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const r = await createChannel(name);
          if (r?.error) setError(r.error);
        });
      }}
    >
      <label htmlFor="new-ch" className="sr-only">
        New channel
      </label>
      <input
        id="new-ch"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Create a channel…"
        className="min-h-[44px] flex-1 rounded border border-moss/30 px-2 py-1"
      />
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="min-h-[44px] rounded border border-moss px-3 py-1"
      >
        Create
      </button>
      {error && <p className="w-full text-xs text-red-800">{error}</p>}
    </form>
  );
}
