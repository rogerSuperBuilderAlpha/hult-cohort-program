"use client";

import { useState, useTransition } from "react";
import {
  archiveChannel,
  createChannel,
  renameChannel,
} from "@/app/actions";

type Props = {
  channelId: string;
  channelName: string;
  isAdmin: boolean;
};

export function ChannelAdminTools({ channelId, channelName, isAdmin }: Props) {
  const [name, setName] = useState(channelName);
  const [newChannel, setNewChannel] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isAdmin) return null;

  return (
    <details className="border-b border-moss/15 bg-paper-dark/30 px-4 py-2 text-sm">
      <summary className="cursor-pointer font-medium text-moss">Channel admin</summary>
      <div className="mt-3 space-y-3">
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const r = await renameChannel(channelId, name);
              setMessage(r?.error ?? "Renamed");
            });
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded border border-moss/30 px-2 py-1"
            aria-label="Rename channel"
          />
          <button type="submit" disabled={pending} className="rounded border px-2 py-1">
            Rename
          </button>
        </form>
        <button
          type="button"
          disabled={pending}
          className="rounded border border-red-900/30 px-2 py-1 text-red-900"
          onClick={() =>
            startTransition(async () => {
              await archiveChannel(channelId);
            })
          }
        >
          Archive channel
        </button>
        <form
          className="flex flex-wrap gap-2 border-t border-moss/15 pt-3"
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              await createChannel(newChannel);
            });
          }}
        >
          <input
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="New channel name"
            className="flex-1 rounded border border-moss/30 px-2 py-1"
          />
          <button type="submit" disabled={pending} className="rounded bg-moss px-2 py-1 text-paper">
            Create channel
          </button>
        </form>
        {message && <p className="text-xs">{message}</p>}
      </div>
    </details>
  );
}
