import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getSessionUser } from "@/lib/auth";
import { countUnreadNotifications } from "@/lib/db";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const unread = await countUnreadNotifications(user.id);

  return (
    <AppShell user={user} unread={unread}>
      <section className="panel" style={{ maxWidth: 720, margin: "0 auto" }}>
        <p className="brand-sub">Account</p>
        <h1 style={{ fontSize: "1.4rem" }}>Profile</h1>
        <div className="task-list" style={{ marginTop: "0.75rem" }}>
          <div className="row-split">
            <span className="muted">Name</span>
            <strong>{user.name}</strong>
          </div>
          <div className="row-split">
            <span className="muted">Username</span>
            <strong>@{user.username}</strong>
          </div>
          <div className="row-split">
            <span className="muted">Email</span>
            <strong>{user.email}</strong>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
