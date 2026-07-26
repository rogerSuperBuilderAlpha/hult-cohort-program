import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import type { SessionUser } from "@/lib/auth";
import { channelLabel } from "@/lib/channels";
import type { Channel, UserPublic } from "@/lib/types";
import { ChannelSearch } from "./ChannelSearch";
import { SubmitButton } from "./SubmitButton";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AppShell({
  user,
  channels,
  dms,
  unread,
  activeHref,
  rail,
  children,
}: {
  user: SessionUser;
  channels: Channel[];
  dms: Array<{ conversationId: string; peer: UserPublic }>;
  unread: number;
  activeHref?: string;
  rail?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pmUrl =
    process.env.NEXT_PUBLIC_PM_URL ?? "https://pilot-hult-pm.vercel.app";
  const isHome =
    !activeHref ||
    activeHref === "/app" ||
    activeHref.startsWith("/app/c/");
  const isDm =
    activeHref === "/app/dm" || Boolean(activeHref?.startsWith("/app/dm/"));
  const isNotifications = activeHref === "/app/notifications";
  const activeChannel = channels.find(
    (c) => activeHref === `/app/c/${c.slug}`,
  );

  return (
    <div className="shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-block">
          <Link href="/app" className="brand" aria-label="Huddle home">
            <span className="brand-mark" aria-hidden="true">
              H
            </span>
            <span className="brand-word">Huddle</span>
          </Link>
          <p className="brand-tagline">Cohort feed</p>
        </div>

        <nav className="side-nav" aria-label="Main">
          <Link href="/app" className={isHome ? "active" : ""}>
            <span className="nav-icon" aria-hidden="true">
              ⌂
            </span>
            Home
          </Link>
          <Link
            href="/app/notifications"
            className={isNotifications ? "active" : ""}
          >
            <span className="nav-icon" aria-hidden="true">
              ✶
            </span>
            Notifications
            {unread > 0 ? (
              <span className="nav-badge" aria-label={`${unread} unread`}>
                {unread}
              </span>
            ) : null}
          </Link>
          <Link href="/app/dm" className={isDm ? "active" : ""}>
            <span className="nav-icon" aria-hidden="true">
              ✉
            </span>
            Messages
          </Link>
          <a href={pmUrl} target="_blank" rel="noreferrer">
            <span className="nav-icon" aria-hidden="true">
              ↗
            </span>
            FlexiFlow PM
          </a>
        </nav>

        <ChannelSearch
          channels={channels}
          activeHref={activeHref}
          canCreate={user.role === "ADMIN"}
        />

        <div className="side-section">
          <div className="side-heading">Direct messages</div>
          <ul>
            {dms.length === 0 ? (
              <li className="muted side-empty">No DMs yet</li>
            ) : (
              dms.map((dm) => {
                const href = `/app/dm/${dm.conversationId}`;
                return (
                  <li key={dm.conversationId}>
                    <Link
                      href={href}
                      className={activeHref === href ? "active" : ""}
                    >
                      <span className="avatar avatar-sm" aria-hidden="true">
                        {initials(dm.peer.name)}
                      </span>
                      <span className="side-link-text">
                        <span className="side-link-name">{dm.peer.name}</span>
                        <span className="muted">@{dm.peer.username}</span>
                      </span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
          <Link href="/app/dm" className="side-action">
            + Message someone
          </Link>
        </div>

        <div className="side-foot">
          <div className="user-chip">
            <span className="avatar" aria-hidden="true">
              {initials(user.name)}
            </span>
            <div className="user-chip-text">
              <strong>{user.name}</strong>
              <div className="muted">@{user.username}</div>
            </div>
          </div>
          <form action={logoutAction}>
            <SubmitButton className="ghost-btn">Sign out</SubmitButton>
          </form>
        </div>
      </aside>

      <div className="main-column">
        <header className="mobile-topbar">
          <Link href="/app" className="brand brand-compact" aria-label="Huddle home">
            <span className="brand-mark" aria-hidden="true">
              H
            </span>
            <span className="brand-word">Huddle</span>
          </Link>
          <div className="user-chip user-chip-compact">
            <span className="avatar avatar-sm" aria-hidden="true">
              {initials(user.name)}
            </span>
          </div>
        </header>
        <main id="main-content" className="main feed-enter">
          {children}
        </main>
      </div>

      <aside className="rail" aria-label="Context">
        {rail ?? (
          <DefaultRail
            channels={channels}
            activeChannel={activeChannel}
            unread={unread}
          />
        )}
      </aside>

      <nav className="mobile-nav" aria-label="Mobile primary">
        <Link href="/app" className={isHome ? "active" : ""}>
          Home
        </Link>
        <Link href="/app/dm" className={isDm ? "active" : ""}>
          Messages
        </Link>
        <Link
          href="/app/notifications"
          className={isNotifications ? "active" : ""}
        >
          Alerts{unread > 0 ? ` · ${unread}` : ""}
        </Link>
        <a href={pmUrl} target="_blank" rel="noreferrer">
          PM
        </a>
      </nav>
    </div>
  );
}

function DefaultRail({
  channels,
  activeChannel,
  unread,
}: {
  channels: Channel[];
  activeChannel?: Channel;
  unread: number;
}) {
  return (
    <div className="rail-stack">
      {activeChannel ? (
        <section className="rail-block">
          <h2 className="rail-title">About</h2>
          <p className="rail-channel-name">{channelLabel(activeChannel)}</p>
          <p className="muted">
            {activeChannel.description || "Public channel for the cohort."}
          </p>
          {activeChannel.kind === "announcements" ? (
            <p className="rail-note">Staff-only posting</p>
          ) : null}
        </section>
      ) : (
        <section className="rail-block">
          <h2 className="rail-title">Welcome</h2>
          <p className="muted">
            Your cohort feed — channels, DMs, and announcements in one place.
          </p>
        </section>
      )}

      <section className="rail-block">
        <h2 className="rail-title">Active channels</h2>
        <ul className="rail-list">
          {channels.slice(0, 6).map((channel) => (
            <li key={channel.id}>
              <Link href={`/app/c/${channel.slug}`}>
                {channelLabel(channel)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rail-block">
        <h2 className="rail-title">Tips</h2>
        <ul className="rail-tips">
          <li>Use @username to mention someone</li>
          <li>Search from Channels to find messages</li>
          {unread > 0 ? (
            <li>
              <Link href="/app/notifications">
                You have {unread} unread notification
                {unread === 1 ? "" : "s"}
              </Link>
            </li>
          ) : (
            <li>New messages appear within a few seconds</li>
          )}
        </ul>
      </section>
    </div>
  );
}
