"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(app)/notifications/actions";
import {
  hrefForEntityRef,
  labelForNotification,
  type AppNotification,
} from "@/lib/notifications";

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [count, list] = await Promise.all([
        countUnreadNotifications(),
        listNotifications(30),
      ]);
      setUnread(count);
      setItems(list);
    } catch {
      // bell is non-blocking
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  return (
    <div className="relative">
      <button
        type="button"
        data-testid="notification-bell"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void refresh();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg)] text-sm text-[var(--color-dark)] hover:bg-[color-mix(in_srgb,var(--color-primary)_12%,white)]"
      >
        <span aria-hidden className="text-base font-semibold">
          N
        </span>
        {unread > 0 ? (
          <span
            data-testid="notification-badge"
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            data-testid="notification-panel"
            className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-secondary)_18%,transparent)] bg-[var(--color-surface)] shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)] px-4 py-3">
              <h2 className="text-sm font-semibold text-[var(--color-dark)]">Notifications</h2>
              <button
                type="button"
                data-testid="notification-mark-all"
                className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                disabled={loading || unread === 0}
                onClick={() => {
                  setLoading(true);
                  void markAllNotificationsRead()
                    .then(() => refresh())
                    .finally(() => setLoading(false));
                }}
              >
                Mark all read
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <li
                  data-testid="notification-empty"
                  className="px-4 py-8 text-center text-sm text-[var(--color-secondary)]"
                >
                  You’re all caught up.
                </li>
              ) : (
                items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={hrefForEntityRef(n.entity_ref)}
                      data-testid={`notification-item-${n.id}`}
                      data-unread={n.is_read ? "false" : "true"}
                      className={[
                        "block px-4 py-3 text-sm hover:bg-[var(--color-bg)]",
                        n.is_read ? "opacity-70" : "",
                      ].join(" ")}
                      onClick={() => {
                        if (!n.is_read) void markNotificationRead(n.id).then(() => refresh());
                        setOpen(false);
                      }}
                    >
                      <p className="font-medium text-[var(--color-dark)]">
                        {labelForNotification(n)}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-secondary)]">
                        {new Date(n.created_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
