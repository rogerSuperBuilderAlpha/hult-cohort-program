"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/lib/types";

export function NotificationsPanel() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [pending, startTransition] = useTransition();

  async function load() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userData.user.id)
      .is("read_at", null)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems((data as NotificationRow[]) ?? []);
  }

  useEffect(() => {
    void load();
    const supabase = createClient();
    const channel = supabase
      .channel("notifications-self")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => void load(),
      )
      .subscribe();
    const poll = setInterval(() => void load(), 5000);
    return () => {
      void supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, []);

  const unread = items.length;

  return (
    <div className="rounded border border-moss/20 bg-paper p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase text-moss">
          Notifications {unread ? `(${unread})` : ""}
        </span>
        {unread > 0 && (
          <button
            type="button"
            disabled={pending}
            className="text-xs underline"
            onClick={() =>
              startTransition(async () => {
                await markAllNotificationsRead();
                await load();
              })
            }
          >
            Mark all read
          </button>
        )}
      </div>
      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
        {items.length === 0 && <li className="text-ink/60">No new alerts</li>}
        {items.map((n) => (
          <li key={n.id} className="flex items-start justify-between gap-2">
            <Link
              href={
                n.channel_id
                  ? n.type === "dm"
                    ? `/dm/${n.channel_id}`
                    : `/channels/general`
                  : "#"
              }
              className="flex-1"
              onClick={() =>
                startTransition(async () => {
                  await markNotificationRead(n.id);
                  await load();
                })
              }
            >
              {n.type === "mention" ? "@mention" : "New DM"}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
