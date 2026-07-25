"use client";

import { useEffect, useState, useTransition } from "react";
import type { NotificationLevel } from "@/lib/types";
import {
  getMyChannelNotificationLevel,
  setChannelNotificationLevel,
} from "@/app/(app)/notifications/actions";

export function ChannelNotificationLevel({ channelId }: { channelId: string }) {
  const [level, setLevel] = useState<NotificationLevel>("all");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    void getMyChannelNotificationLevel(channelId)
      .then(setLevel)
      .catch(() => undefined);
  }, [channelId]);

  return (
    <label className="flex items-center gap-2 text-xs text-[var(--color-secondary)]">
      <span className="hidden sm:inline">Notify</span>
      <select
        data-testid="channel-notify-level"
        value={level}
        disabled={pending}
        className="rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-dark)]"
        onChange={(e) => {
          const next = e.target.value as NotificationLevel;
          setLevel(next);
          startTransition(async () => {
            await setChannelNotificationLevel({ channelId, level: next });
          });
        }}
      >
        <option value="all">All</option>
        <option value="mentions">Mentions</option>
        <option value="mute">Mute</option>
      </select>
    </label>
  );
}
