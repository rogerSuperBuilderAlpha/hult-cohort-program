"use client";

import Link from "next/link";
import type { WorkspaceState } from "@/lib/types";
import { forthHomeUrl, forthTicketsUrl } from "@/lib/forth";

type Props = {
  state: WorkspaceState;
  open: boolean;
  onClose: () => void;
  onSelectChannel: (id: string) => void;
  onReset: () => void;
  onStartGroupChat: () => void;
};

function StatusDot({ status }: { status: "online" | "away" | "offline" }) {
  const color =
    status === "online"
      ? "var(--online)"
      : status === "away"
        ? "var(--away)"
        : "var(--offline)";
  return (
    <span
      className="inline-block h-2 w-2"
      style={{ background: color }}
      aria-hidden
    />
  );
}

export function WorkspaceSidebar({
  state,
  open,
  onClose,
  onSelectChannel,
  onReset,
  onStartGroupChat,
}: Props) {
  const channels = state.channels.filter((c) => c.kind === "channel");
  const groups = state.channels.filter((c) => c.kind === "group");
  const dms = state.channels.filter((c) => c.kind === "dm");
  const you = state.members.find((m) => m.id === state.currentUserId);

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[var(--ink)]/40 lg:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[272px] flex-col border-r-[1.5px] border-[var(--line)] bg-[var(--sidebar)] text-[var(--sidebar-text)] transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/15 px-4 py-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-ibm-plex-mono)] text-lg font-bold tracking-[0.12em] text-[var(--sidebar-text)]"
          >
            FIRESIDE
          </Link>
          <p className="mt-1 font-[family-name:var(--font-ibm-plex-mono)] text-[10px] uppercase tracking-[0.16em] text-[var(--olive)]">
            Comms for Forth
          </p>
          <Link
            href="/signin"
            className="mt-2 block font-[family-name:var(--font-ibm-plex-mono)] text-[10px] uppercase tracking-[0.12em] text-white/50 hover:text-[var(--gold)]"
          >
            Sign in
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="forth-label mb-2 px-2 text-[var(--olive)]">Channels</p>
          <ul className="space-y-0.5">
            {channels.map((channel) => {
              const active = channel.id === state.activeChannelId;
              return (
                <li key={channel.id}>
                  <button
                    type="button"
                    onClick={() => onSelectChannel(channel.id)}
                    className={`flex w-full items-center justify-between border px-2.5 py-2 text-left font-[family-name:var(--font-ibm-plex-mono)] text-xs transition ${
                      active
                        ? "border-[var(--gold)] bg-white/5 font-semibold text-[var(--sidebar-text)]"
                        : "border-transparent text-white/70 hover:border-white/20 hover:text-[var(--sidebar-text)]"
                    }`}
                  >
                    <span>
                      <span className="mr-1 text-white/40">#</span>
                      {channel.name}
                    </span>
                    {!!channel.unread && (
                      <span className="border border-[var(--gold)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--gold)]">
                        {channel.unread}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mb-2 mt-5 flex items-center justify-between px-2">
            <p className="forth-label text-[var(--olive)]">Group chats</p>
            <button
              type="button"
              onClick={onStartGroupChat}
              className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--gold)] hover:underline"
            >
              + Start
            </button>
          </div>
          {groups.length === 0 ? (
            <button
              type="button"
              onClick={onStartGroupChat}
              className="w-full border border-dashed border-white/25 px-2.5 py-3 text-left font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-white/55 transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              Start group chat
            </button>
          ) : (
            <ul className="space-y-0.5">
              {groups.map((group) => {
                const active = group.id === state.activeChannelId;
                return (
                  <li key={group.id}>
                    <button
                      type="button"
                      onClick={() => onSelectChannel(group.id)}
                      className={`flex w-full items-center gap-2 border px-2.5 py-2 text-left font-[family-name:var(--font-ibm-plex-mono)] text-xs ${
                        active
                          ? "border-[var(--gold)] bg-white/5 font-semibold"
                          : "border-transparent text-white/70 hover:border-white/20"
                      }`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-[var(--olive)] text-[10px] font-bold text-[var(--olive)]">
                        G
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {group.name}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {group.memberIds?.length ?? 0}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="forth-label mb-2 mt-5 px-2 text-[var(--olive)]">
            Direct messages
          </p>
          <ul className="space-y-0.5">
            {dms.map((dm) => {
              const peerId = dm.memberIds?.find(
                (id) => id !== state.currentUserId
              );
              const peer = state.members.find((m) => m.id === peerId);
              const active = dm.id === state.activeChannelId;
              return (
                <li key={dm.id}>
                  <button
                    type="button"
                    onClick={() => onSelectChannel(dm.id)}
                    className={`flex w-full items-center gap-2 border px-2.5 py-2 text-left font-[family-name:var(--font-ibm-plex-mono)] text-xs ${
                      active
                        ? "border-[var(--gold)] bg-white/5 font-semibold"
                        : "border-transparent text-white/70 hover:border-white/20"
                    }`}
                  >
                    {peer && <StatusDot status={peer.status} />}
                    <span className="truncate">{dm.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="forth-label mb-2 mt-5 px-2 text-[var(--olive)]">Team</p>
          <ul className="space-y-1 px-1">
            {state.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-2 px-1.5 py-1 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] text-white/65"
              >
                <span className="flex h-7 w-7 items-center justify-center border border-white/25 text-[10px] font-bold text-[var(--sidebar-text)]">
                  {member.initials}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="block text-[var(--sidebar-text)]">
                    {member.name}
                    {member.id === state.currentUserId ? " (you)" : ""}
                  </span>
                  <span className="text-white/40">@{member.handle}</span>
                </span>
                <StatusDot status={member.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 border-t border-white/15 p-3">
          <a
            href={forthHomeUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="forth-btn flex items-center justify-between bg-[var(--olive)] px-3 py-2.5 text-[var(--ink)]"
          >
            Open Forth
            <span aria-hidden>↗</span>
          </a>
          <a
            href={forthTicketsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-white/25 px-3 py-2 font-[family-name:var(--font-ibm-plex-mono)] text-[11px] uppercase tracking-[0.1em] text-white/70 transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
          >
            View all tickets
          </a>
          <div className="flex items-center justify-between px-1 pt-1 font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-white/45">
            <span>{you?.name ?? "You"}</span>
            <button
              type="button"
              onClick={onReset}
              className="uppercase tracking-[0.1em] hover:text-[var(--gold)]"
            >
              Reset demo
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
