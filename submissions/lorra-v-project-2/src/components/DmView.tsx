"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";
import { listParentMessages } from "@/app/(app)/messaging/actions";
import {
  listConversationMembers,
  markConversationRead,
  type ConversationSummary,
} from "@/app/(app)/messages/actions";
import { MessageComposer } from "@/components/MessageComposer";
import { MessageItem } from "@/components/MessageItem";
import { ThreadPanel } from "@/components/ThreadPanel";

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

export function DmView({
  conversation,
  currentUser,
  initialMessages,
  initialMembers,
  initialThreadId = null,
}: {
  conversation: ConversationSummary;
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
        listParentMessages("conversation", conversation.id),
        listConversationMembers(conversation.id),
      ]);
      setMessages(msgs);
      setMembers(mems);
      setError(null);
      await markConversationRead(conversation.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to refresh");
    }
  }, [conversation.id]);

  useEffect(() => {
    setMessages(initialMessages);
    setMembers(initialMembers);
  }, [conversation.id]); // eslint-disable-line react-hooks/exhaustive-deps -- sync on conversation switch only

  useEffect(() => {
    void markConversationRead(conversation.id);
  }, [conversation.id]);

  useEffect(() => {
    setThreadRootId(initialThreadId);
  }, [initialThreadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `messages:conversation:${conversation.id}`;
    const sub = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `parent_id=eq.${conversation.id}`,
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
  }, [conversation.id, refresh]);

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
    <div data-testid="dm-view" className="flex h-[calc(100vh-7rem)] min-h-[420px] gap-4">
      <section className="flex min-w-0 flex-1 flex-col rounded-[var(--radius-card)] bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(22,50,79,0.04)]">
        <header className="flex items-start justify-between gap-3 border-b border-[color-mix(in_srgb,var(--color-secondary)_15%,transparent)] px-5 py-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">
              {conversation.type === "group_dm" ? "Group DM" : "Direct message"}
            </p>
            <h1
              data-testid="dm-title"
              className="text-2xl font-semibold text-[var(--color-dark)]"
            >
              {conversation.title}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-secondary)]">
              {members.length} {members.length === 1 ? "person" : "people"}
            </p>
          </div>
        </header>

        <div
          data-testid="message-list"
          className="flex-1 space-y-1 overflow-y-auto px-2 py-3"
        >
          {messages.length === 0 ? (
            <p className="px-4 py-8 text-sm text-[var(--color-secondary)]">
              No messages yet. Start the conversation.
            </p>
          ) : (
            messages.map((m) => (
              <MessageItem
                key={m.id}
                message={m}
                currentUser={currentUser}
                parentType="conversation"
                pathKey={conversation.id}
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
            parentType="conversation"
            parentId={conversation.id}
            pathKey={conversation.id}
            placeholder={`Message ${conversation.title}`}
            members={memberOptions}
            onSent={() => void refresh()}
          />
        </div>
      </section>

      {threadRootId ? (
        <ThreadPanel
          threadRootId={threadRootId}
          parentType="conversation"
          pathKey={conversation.id}
          parentLabel={conversation.title}
          members={memberOptions}
          currentUser={currentUser}
          onClose={closeThread}
          onChanged={() => void refresh()}
        />
      ) : (
        <aside
          data-testid="dm-members"
          className="hidden w-56 shrink-0 rounded-[var(--radius-card)] bg-[var(--color-surface)] p-4 lg:block"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
            Members ({members.length})
          </h2>
          <ul className="mt-3 space-y-2">
            {members.map((m) => (
              <li key={m.user_id} className="flex items-center gap-2 text-sm text-[var(--color-dark)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-bg)] text-xs font-semibold">
                  {(m.profiles?.display_name || "?").charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{m.profiles?.display_name || m.user_id}</span>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
