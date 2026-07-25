"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Channel, Message } from "@/lib/types";
import {
  listChannelMembers,
  listChannelMessages,
  archiveChannel,
  markChannelRead,
} from "@/app/(app)/channels/actions";
import { MessageComposer } from "@/components/MessageComposer";
import { MessageItem } from "@/components/MessageItem";
import { ThreadPanel } from "@/components/ThreadPanel";
import { ChannelNotificationLevel } from "@/components/ChannelNotificationLevel";
import { PresenceDot } from "@/components/PresenceProvider";
import { AdminBadge } from "@/components/AdminBadge";
import Link from "next/link";

type MemberRow = {
  user_id: string;
  profiles?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    email: string;
    role: string;
  } | null;
};

export function ChannelView({
  channel,
  currentUser,
  initialMessages,
  initialMembers,
  initialThreadId = null,
}: {
  channel: Channel;
  currentUser: { id: string; role: string; displayName: string };
  initialMessages: Message[];
  initialMembers: MemberRow[];
  initialThreadId?: string | null;
}) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [members, setMembers] = useState<MemberRow[]>(initialMembers);
  const [threadRootId, setThreadRootId] = useState<string | null>(initialThreadId);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const [msgs, mems] = await Promise.all([
        listChannelMessages(channel.id),
        listChannelMembers(channel.id),
      ]);
      setMessages(msgs);
      setMembers(mems);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to refresh");
    }
  }, [channel.id]);

  useEffect(() => {
    setMessages(initialMessages);
    setMembers(initialMembers);
  }, [channel.id]); // eslint-disable-line react-hooks/exhaustive-deps -- sync on channel switch only

  useEffect(() => {
    void markChannelRead(channel.id).catch(() => undefined);
  }, [channel.id]);

  useEffect(() => {
    setThreadRootId(initialThreadId);
  }, [initialThreadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `messages:channel:${channel.id}`;
    const sub = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `parent_id=eq.${channel.id}`,
        },
        () => {
          void refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions" },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(sub);
    };
  }, [channel.id, refresh]);

  function openThread(id: string) {
    setThreadRootId(id);
    window.history.replaceState(null, "", `${pathname}?thread=${id}`);
  }

  function closeThread() {
    setThreadRootId(null);
    window.history.replaceState(null, "", pathname);
    void refresh();
  }

  const memberOptions = members
    .map((m) => m.profiles)
    .filter(Boolean)
    .map((p) => ({ id: p!.id, display_name: p!.display_name }));

  return (
    <div
      data-testid="channel-view"
      className="relative flex h-[calc(100vh-7rem)] min-h-[420px] gap-4"
    >
      <section
        className={[
          "flex min-w-0 flex-1 flex-col rounded-[var(--radius-card)] bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(22,50,79,0.04)]",
          threadRootId ? "hidden md:flex" : "flex",
        ].join(" ")}
      >
        <header className="flex items-start justify-between gap-3 border-b border-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)] px-5 py-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">Channel</p>
            <h1
              data-testid="channel-title"
              className="text-2xl font-semibold text-[var(--color-dark)]"
            >
              #{channel.name}
            </h1>
            {channel.description ? (
              <p className="mt-1 text-sm text-[var(--color-secondary)]">{channel.description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/search?channel=${channel.id}`}
              data-testid="channel-search-link"
              className="rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
            >
              Search
            </Link>
            <ChannelNotificationLevel channelId={channel.id} />
            {currentUser.role === "admin" ? (
              <button
                type="button"
                data-testid="archive-channel"
                className="rounded-[var(--radius-button)] border border-[color-mix(in_srgb,var(--color-secondary)_25%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--color-secondary)]"
                onClick={async () => {
                  if (!confirm(`Archive #${channel.name}?`)) return;
                  await archiveChannel({
                    channelId: channel.id,
                    channelSlug: channel.name,
                  });
                  window.location.href = "/";
                }}
              >
                Archive
              </button>
            ) : null}
          </div>
        </header>

        <div
          data-testid="message-list"
          className="flex-1 space-y-1 overflow-y-auto px-2 py-3"
        >
          {messages.length === 0 ? (
            <div className="px-4 py-8">
              <p className="text-sm font-medium text-[var(--color-dark)]">
                No messages yet
              </p>
              <p className="mt-1 text-sm text-[var(--color-secondary)]">
                Say hello to the cohort — mentions, attachments, and Forth tickets
                start here.
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <MessageItem
                key={m.id}
                message={m}
                currentUser={currentUser}
                parentType="channel"
                pathKey={channel.name}
                onChanged={() => void refresh()}
                onOpenThread={() => openThread(m.id)}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)] p-4">
          {error ? (
            <p className="mb-2 text-xs text-[var(--color-danger)]">{error}</p>
          ) : null}
          <MessageComposer
            parentType="channel"
            parentId={channel.id}
            pathKey={channel.name}
            placeholder={`Message #${channel.name}`}
            members={memberOptions}
            adminPostOnly={channel.admin_post_only}
            isAdmin={currentUser.role === "admin"}
            onSent={() => void refresh()}
          />
        </div>
      </section>

      {threadRootId ? (
        <ThreadPanel
          threadRootId={threadRootId}
          parentType="channel"
          pathKey={channel.name}
          parentLabel={`#${channel.name}`}
          members={memberOptions}
          currentUser={currentUser}
          onClose={closeThread}
          onChanged={() => void refresh()}
        />
      ) : (
        <aside
          data-testid="channel-members"
          className="hidden w-56 shrink-0 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-4 lg:block"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
            Members ({members.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {members.map((m) => (
              <li key={m.user_id} className="flex items-center gap-2 text-sm text-[var(--color-dark)]">
                <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg)] text-xs font-semibold">
                  {(m.profiles?.display_name || "?").charAt(0).toUpperCase()}
                  <PresenceDot
                    userId={m.user_id}
                    className="absolute bottom-0 right-0 ring-2 ring-[var(--color-surface)]"
                  />
                </span>
                <span className="truncate">{m.profiles?.display_name || m.user_id}</span>
                {m.profiles?.role === "admin" ? <AdminBadge /> : null}
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
