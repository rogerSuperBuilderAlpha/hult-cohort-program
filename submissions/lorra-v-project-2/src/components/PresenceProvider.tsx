"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

type PresenceContextValue = {
  onlineIds: Set<string>;
  isOnline: (userId: string) => boolean;
};

const PresenceContext = createContext<PresenceContextValue>({
  onlineIds: new Set(),
  isOnline: () => false,
});

export function usePresence() {
  return useContext(PresenceContext);
}

/** Online/offline via Supabase Presence + 60s heartbeat (PRD §4.6). */
export function PresenceProvider({
  userId,
  displayName,
  children,
}: {
  userId: string;
  displayName: string;
  children: ReactNode;
}) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set([userId]));

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("conexus-workspace-presence", {
      config: { presence: { key: userId } },
    });

    const sync = () => {
      const state = channel.presenceState();
      setOnlineIds(new Set(Object.keys(state)));
    };

    channel.on("presence", { event: "sync" }, sync);
    channel.on("presence", { event: "join" }, sync);
    channel.on("presence", { event: "leave" }, sync);

    void channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          userId,
          displayName,
          online_at: new Date().toISOString(),
        });
      }
    });

    const heartbeat = window.setInterval(() => {
      void channel.track({
        userId,
        displayName,
        online_at: new Date().toISOString(),
      });
    }, 60_000);

    return () => {
      window.clearInterval(heartbeat);
      void supabase.removeChannel(channel);
    };
  }, [userId, displayName]);

  const value = useMemo(
    () => ({
      onlineIds,
      isOnline: (id: string) => onlineIds.has(id),
    }),
    [onlineIds],
  );

  return (
    <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
  );
}

export function PresenceDot({
  userId,
  className = "",
}: {
  userId: string;
  className?: string;
}) {
  const { isOnline } = usePresence();
  const online = isOnline(userId);
  return (
    <span
      data-testid="presence-dot"
      data-online={online ? "true" : "false"}
      data-user-id={userId}
      title={online ? "Online" : "Offline"}
      className={[
        "inline-block h-2 w-2 shrink-0 rounded-full",
        online ? "bg-emerald-500" : "bg-[color-mix(in_srgb,var(--color-secondary)_45%,transparent)]",
        className,
      ].join(" ")}
    />
  );
}
