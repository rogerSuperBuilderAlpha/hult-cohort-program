"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/types";

const POLL_MS = 4000;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessagePane({
  initialMessages,
  channelId,
  conversationId,
}: {
  initialMessages: Message[];
  channelId?: string;
  conversationId?: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const latest = messages[messages.length - 1]?.created_at;

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const params = new URLSearchParams();
      if (channelId) params.set("channelId", channelId);
      if (conversationId) params.set("conversationId", conversationId);
      if (latest) params.set("since", latest);
      try {
        const response = await fetch(`/api/messages?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as { messages?: Message[] };
        const incoming = data.messages ?? [];
        if (cancelled || incoming.length === 0) return;
        setMessages((current) => {
          const seen = new Set(current.map((m) => m.id));
          const merged = [...current];
          for (const message of incoming) {
            if (!seen.has(message.id)) merged.push(message);
          }
          return merged;
        });
      } catch {
        // Ignore transient network errors; next poll retries.
      }
    }

    const id = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [channelId, conversationId, latest]);

  if (messages.length === 0) {
    return <div className="empty">No posts yet. Start the conversation.</div>;
  }

  return (
    <div className="message-list" aria-live="polite">
      {messages.map((message) => {
        const displayName = message.author?.name ?? "Someone";
        const username = message.author?.username ?? "someone";
        return (
          <article key={message.id} className="message post">
            <span className="avatar" aria-hidden="true">
              {initials(displayName)}
            </span>
            <div className="post-body">
              <header className="post-meta">
                <span className="post-author">
                  <strong>{displayName}</strong>
                  <span className="muted">@{username}</span>
                </span>
                <time dateTime={message.created_at}>
                  {formatTime(message.created_at)}
                </time>
              </header>
              <p>{message.body}</p>
            </div>
          </article>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
