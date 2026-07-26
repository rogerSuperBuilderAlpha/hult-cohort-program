import { redirect } from "next/navigation";
import { markNotificationsReadAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { listNotifications } from "@/lib/db";
import { withShell } from "@/lib/shell";
import { SubmitButton } from "@/components/SubmitButton";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const notifications = await listNotifications(user.id);

  return withShell(user, "/app/notifications", (
    <section className="panel stack">
      <div className="cta-row" style={{ justifyContent: "space-between" }}>
        <div>
          <p className="muted">Inbox</p>
          <h1>Notifications</h1>
          <p className="lead" style={{ marginBottom: 0 }}>
            Mentions and direct messages.
          </p>
        </div>
        <form action={markNotificationsReadAction}>
          <SubmitButton className="btn-secondary">Mark all read</SubmitButton>
        </form>
      </div>
      <div className="result-list">
        {notifications.length === 0 ? (
          <div className="empty">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <a key={n.id} href={n.link || "/app"}>
              <div>
                <strong>{n.read ? "Read" : "Unread"}</strong>
                <div className="muted">{n.body}</div>
              </div>
              <span className="muted">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </a>
          ))
        )}
      </div>
    </section>
  ));
}
