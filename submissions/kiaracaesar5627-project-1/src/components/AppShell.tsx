import Link from "next/link";
import { cookies } from "next/headers";
import { logoutAction, updateThemeAction } from "@/lib/actions";
import type { SessionUser } from "@/lib/auth";
import { canManageWorkspace } from "@/lib/roles";
import { ACCENT_COOKIE, normalizeAccent, THEME_COOKIE } from "@/lib/theme";
import type { Workspace, WorkspaceRole } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

type NavKey = "dashboard" | "projects" | "calendar" | "members" | "settings";

export async function AppShell({
  user,
  workspace,
  role,
  workspaces,
  unread = 0,
  active,
  children,
}: {
  user: SessionUser;
  workspace?: Workspace;
  role?: WorkspaceRole;
  workspaces?: Workspace[];
  unread?: number;
  active?: NavKey;
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const theme = jar.get(THEME_COOKIE)?.value === "dark" ? "dark" : "light";
  const accent = normalizeAccent(jar.get(ACCENT_COOKIE)?.value);
  const nextTheme = theme === "dark" ? "light" : "dark";
  const base = workspace ? `/w/${workspace.id}` : "";
  const f = workspace?.features;

  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/workspaces" className="brand-lockup">
          <span className="brand-mark" aria-hidden />
          <span className="brand">FlexiFlow</span>
        </Link>

        {workspace ? (
          <nav className="nav">
            <Link className={active === "dashboard" ? "active" : ""} href={base}>
              Dashboard
            </Link>
            <Link className={active === "projects" ? "active" : ""} href={`${base}/projects`}>
              Projects
            </Link>
            {f?.calendar ? (
              <Link
                className={active === "calendar" ? "active" : ""}
                href={`${base}/calendar`}
              >
                Calendar
              </Link>
            ) : null}
            <Link className={active === "members" ? "active" : ""} href={`${base}/members`}>
              Team
            </Link>
            {role && canManageWorkspace(role) ? (
              <Link
                className={active === "settings" ? "active" : ""}
                href={`${base}/settings`}
              >
                Settings
              </Link>
            ) : null}
          </nav>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        <div className="topbar-right">
          {workspace && workspaces && workspaces.length > 0 ? (
            <details className="ws-switch">
              <summary>
                <span
                  className="dot"
                  style={{ background: workspace.accent_color }}
                  aria-hidden
                />
                {workspace.name}
                <span className="muted">▾</span>
              </summary>
              <div className="ws-menu">
                {workspaces.map((w) => (
                  <Link key={w.id} href={`/w/${w.id}`}>
                    <span
                      className="dot"
                      style={{ background: w.accent_color, marginRight: 6 }}
                      aria-hidden
                    />
                    {w.name}
                  </Link>
                ))}
                <hr />
                <Link href="/workspaces">All workspaces</Link>
              </div>
            </details>
          ) : null}

          {(!workspace || f?.notifications) ? (
            <Link
              href="/notifications"
              className="icon-btn"
              aria-label="Notifications"
              title="Notifications"
            >
              🔔
              {unread > 0 ? <span className="badge-count">{unread}</span> : null}
            </Link>
          ) : null}

          <details className="ws-switch">
            <summary aria-label="Account menu">
              <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
            </summary>
            <div className="ws-menu">
              <div className="muted" style={{ padding: "0.3rem 0.6rem" }}>
                @{user.username}
              </div>
              <hr />
              <Link href="/account">Appearance & account</Link>
              <form action={updateThemeAction}>
                <input type="hidden" name="theme" value={nextTheme} />
                <input type="hidden" name="accent" value={accent} />
                <input type="hidden" name="redirectTo" value={workspace ? base : "/workspaces"} />
                <button type="submit">
                  Switch to {nextTheme === "dark" ? "dark" : "light"} mode
                </button>
              </form>
              <hr />
              <form action={logoutAction}>
                <SubmitButton className="ghost-btn">Sign out</SubmitButton>
              </form>
            </div>
          </details>
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
