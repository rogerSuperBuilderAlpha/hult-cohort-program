import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { markNotificationsReadAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { listNotifications } from "@/lib/db";
import { getGlobalShellData } from "@/lib/workspace-server";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [notifications, shell] = await Promise.all([
    listNotifications(user.id),
    getGlobalShellData(user),
  ]);

  return (
    <AppShell
      user={shell.user}
      workspace={shell.workspace}
      role={shell.role}
      workspaces={shell.workspaces}
      unread={shell.unread}
    >
      <div className="stack">
        <div className="section-head">
          <div>
            <p className="brand-sub">Inbox</p>
            <h1>Notifications</h1>
          </div>
          {shell.unread > 0 ? (
            <form action={markNotificationsReadAction}>
              <SubmitButton className="ghost-btn">Mark all read</SubmitButton>
            </form>
          ) : null}
        </div>

        <div className="task-list">
          {notifications.length === 0 ? (
            <div className="empty">You&apos;re all caught up.</div>
          ) : (
            notifications.map((n) => {
              const inner = (
                <div className="card-row" style={{ opacity: n.read ? 0.6 : 1 }}>
                  <div className="row-split">
                    <span>{n.body}</span>
                    {!n.read ? (
                      <span
                        className="dot"
                        style={{ background: "var(--accent)" }}
                        aria-hidden
                      />
                    ) : null}
                  </div>
                  <div className="task-meta">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} href={n.link}>
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}
