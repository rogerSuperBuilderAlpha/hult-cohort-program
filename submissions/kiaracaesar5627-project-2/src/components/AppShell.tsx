import Link from "next/link";
import { logoutAction } from "@/lib/actions";
import type { SessionUser } from "@/lib/auth";
import type { Channel, UserPublic } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

export function AppShell({
  user,
  channels,
  dms,
  unread,
  activeHref,
  children,
}: {
  user: SessionUser;
  channels: Channel[];
  dms: Array<{ conversationId: string; peer: UserPublic }>;
  unread: number;
  activeHref?: string;
  children: React.ReactNode;
}) {
  const pmUrl = process.env.NEXT_PUBLIC_PM_URL ?? "https://pilot-hult-pm.vercel.app";

  return (
    <div className="shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <aside className="sidebar" aria-label="Workspace navigation">
        <div className="brand-block">
          <Link href="/app" className="brand">
            Relay
          </Link>
          <p className="muted">Cohort communications</p>
        </div>

        <nav className="side-nav">
          <Link
            href="/app/search"
            className={activeHref === "/app/search" ? "active" : ""}
          >
            Search
          </Link>
          <Link
            href="/app/notifications"
            className={activeHref === "/app/notifications" ? "active" : ""}
          >
            Notifications{unread > 0 ? ` (${unread})` : ""}
          </Link>
          <a href={pmUrl} target="_blank" rel="noreferrer">
            Open FlexiFlow PM ↗
          </a>
        </nav>

        <div className="side-section">
          <div className="side-heading">Channels</div>
          <ul>
            {channels.map((channel) => {
              const href = `/app/c/${channel.slug}`;
              return (
                <li key={channel.id}>
                  <Link href={href} className={activeHref === href ? "active" : ""}>
                    #{channel.name}
                    {channel.kind === "announcements" ? (
                      <span className="tag">staff</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
          {user.role === "ADMIN" ? (
            <Link href="/app/channels/new" className="side-action">
              + New channel
            </Link>
          ) : null}
        </div>

        <div className="side-section">
          <div className="side-heading">Direct messages</div>
          <ul>
            {dms.length === 0 ? (
              <li className="muted" style={{ padding: "0.35rem 0.6rem" }}>
                No DMs yet
              </li>
            ) : (
              dms.map((dm) => {
                const href = `/app/dm/${dm.conversationId}`;
                return (
                  <li key={dm.conversationId}>
                    <Link href={href} className={activeHref === href ? "active" : ""}>
                      @{dm.peer.username}
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
          <div>
            <strong>{user.name}</strong>
            <div className="muted">@{user.username}</div>
          </div>
          <form action={logoutAction}>
            <SubmitButton className="ghost-btn">Sign out</SubmitButton>
          </form>
        </div>
      </aside>
      <main id="main-content" className="main">
        {children}
      </main>
    </div>
  );
}
