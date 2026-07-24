"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { sendMessage } from "@/app/actions";
import { MessageBody } from "@/components/message-body";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";

type Props = {
  channelId: string;
  initialMessages: Message[];
  canPost: boolean;
  readOnlyHint?: string;
};

const POLL_MS = 5000;

export function ChannelChat({
  channelId,
  initialMessages,
  canPost,
  readOnlyHint,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [realtimeOk, setRealtimeOk] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(display_name, email)")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as Message[]);
  }, [channelId]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeOk(false);
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelId, refresh]);

  useEffect(() => {
    if (realtimeOk) return;
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(id);
  }, [realtimeOk, refresh]);

  const roots = messages.filter((m) => !m.parent_id);
  const repliesByParent = messages.reduce<Record<string, Message[]>>((acc, m) => {
    if (!m.parent_id) return acc;
    acc[m.parent_id] = acc[m.parent_id] ?? [];
    acc[m.parent_id].push(m);
    return acc;
  }, {});

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await sendMessage({
        channelId,
        body,
        parentId: replyTo?.id ?? null,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setBody("");
      setReplyTo(null);
      await refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      {!realtimeOk && (
        <p className="border-b border-clay/30 bg-paper-dark/60 px-4 py-2 text-xs text-ink/80">
          Live updates unavailable — refreshing every {POLL_MS / 1000}s.
        </p>
      )}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {roots.map((msg) => (
          <article key={msg.id} className="rounded border border-moss/15 bg-paper p-3">
            <header className="mb-1 flex flex-wrap items-baseline gap-2 text-xs text-ink/70">
              <span className="font-semibold text-ink">
                {msg.is_system
                  ? "System"
                  : (msg.profiles?.display_name ?? "Member")}
              </span>
              <time dateTime={msg.created_at}>
                {new Date(msg.created_at).toLocaleString()}
              </time>
            </header>
            <MessageBody body={msg.body} />
            {canPost && !msg.is_system && (
              <button
                type="button"
                className="mt-2 text-xs text-moss underline"
                onClick={() => setReplyTo(msg)}
              >
                Reply in thread
              </button>
            )}
            {(repliesByParent[msg.id] ?? []).map((reply) => (
              <div
                key={reply.id}
                className="ml-4 mt-3 border-l-2 border-moss/20 pl-3"
              >
                <header className="mb-1 text-xs text-ink/70">
                  <span className="font-semibold text-ink">
                    {reply.profiles?.display_name ?? "Member"}
                  </span>{" "}
                  · {new Date(reply.created_at).toLocaleString()}
                </header>
                <MessageBody body={reply.body} />
              </div>
            ))}
          </article>
        ))}
      </div>
      {canPost ? (
        <form onSubmit={onSubmit} className="border-t border-moss/20 p-4">
          {replyTo && (
            <p className="mb-2 text-xs text-moss">
              Replying to {replyTo.profiles?.display_name ?? "message"}{" "}
              <button type="button" onClick={() => setReplyTo(null)} className="underline">
                cancel
              </button>
            </p>
          )}
          <label className="sr-only" htmlFor="message-body">
            Message
          </label>
          <textarea
            id="message-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full rounded border border-moss/30 bg-paper px-3 py-2 text-sm"
            placeholder="Write a message — @mention a handle, paste a Forth task link"
          />
          {error && (
            <p className="mt-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || !body.trim()}
            className="mt-2 min-h-[44px] rounded bg-moss px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            Send
          </button>
        </form>
      ) : (
        readOnlyHint && (
          <p className="border-t border-moss/20 p-4 text-sm text-ink/70">{readOnlyHint}</p>
        )
      )}
    </div>
  );
}
