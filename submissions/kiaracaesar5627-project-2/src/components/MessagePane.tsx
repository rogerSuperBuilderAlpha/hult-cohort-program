"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/types";

const POLL_MS = 4000;

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
    return <div className="empty">No messages yet. Say hello.</div>;
  }

  return (
    <div className="message-list" aria-live="polite">
      {messages.map((message) => (
        <article key={message.id} className="message">
          <header>
            <strong>@{message.author?.username ?? "someone"}</strong>
            <time dateTime={message.created_at}>
              {new Date(message.created_at).toLocaleString()}
            </time>
          </header>
          <p>{message.body}</p>
        </article>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
