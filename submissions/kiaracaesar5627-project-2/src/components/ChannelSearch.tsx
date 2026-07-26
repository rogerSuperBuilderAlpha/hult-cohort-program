"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { channelLabel } from "@/lib/channels";
import type { Channel } from "@/lib/types";

export function ChannelSearch({
  channels,
  activeHref,
  canCreate,
}: {
  channels: Channel[];
  activeHref?: string;
  canCreate: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!trimmed) return channels;
    return channels.filter((channel) => {
      const label = channelLabel(channel).toLowerCase();
      return (
        label.includes(trimmed) ||
        channel.name.toLowerCase().includes(trimmed) ||
        channel.slug.toLowerCase().includes(trimmed)
      );
    });
  }, [channels, trimmed]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/app/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="side-section">
      <div className="side-heading">Channels</div>
      <form className="side-search" onSubmit={onSubmit} role="search">
        <label className="sr-only" htmlFor="channel-search">
          Search channels and messages
        </label>
        <input
          id="channel-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search channels…"
          autoComplete="off"
        />
      </form>
      <ul>
        {filtered.length === 0 ? (
          <li className="muted" style={{ padding: "0.35rem 0.6rem" }}>
            {trimmed ? (
              <>
                No channels match.{" "}
                <Link href={`/app/search?q=${encodeURIComponent(query.trim())}`}>
                  Search messages
                </Link>
              </>
            ) : (
              "No channels"
            )}
          </li>
        ) : (
          filtered.map((channel) => {
            const href = `/app/c/${channel.slug}`;
            return (
              <li key={channel.id}>
                <Link href={href} className={activeHref === href ? "active" : ""}>
                  <span className="side-link-text">
                    <span className="side-link-name">{channelLabel(channel)}</span>
                  </span>
                  {channel.kind === "announcements" ? (
                    <span className="tag">staff</span>
                  ) : null}
                </Link>
              </li>
            );
          })
        )}
      </ul>
      {trimmed ? (
        <Link
          href={`/app/search?q=${encodeURIComponent(query.trim())}`}
          className="side-action"
        >
          Search messages for “{query.trim()}”
        </Link>
      ) : null}
      {canCreate ? (
        <Link href="/app/channels/new" className="side-action">
          + New channel
        </Link>
      ) : null}
    </div>
  );
}
