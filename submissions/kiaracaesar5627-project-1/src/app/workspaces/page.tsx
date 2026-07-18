import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { createWorkspaceAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { countUnreadNotifications, getMembership, listWorkspacesForUser } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/roles";
import { ACCENT_PRESETS } from "@/lib/theme";

export default async function WorkspacesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [workspaces, unread] = await Promise.all([
    listWorkspacesForUser(user.id),
    countUnreadNotifications(user.id),
  ]);

  const roles = await Promise.all(
    workspaces.map((w) => getMembership(w.id, user.id)),
  );

  return (
    <AppShell user={user} unread={unread}>
      <div className="stack">
        <div className="section-head">
          <div>
            <p className="brand-sub">Your workspaces</p>
            <h1>Where your work lives</h1>
            <p className="lead" style={{ marginBottom: 0 }}>
              Each workspace has its own team, statuses, labels, fields, and
              feature set — tailor them independently.
            </p>
          </div>
        </div>

        <div className="grid-2">
          <div className="project-list">
            {workspaces.length === 0 ? (
              <div className="empty">
                No workspaces yet. Create one to get started →
              </div>
            ) : (
              workspaces.map((w, i) => (
                <Link key={w.id} href={`/w/${w.id}`} className="card-row linky">
                  <div className="row-split">
                    <div className="split">
                      <span
                        className="dot"
                        style={{ background: w.accent_color, width: 12, height: 12 }}
                        aria-hidden
                      />
                      <strong>{w.name}</strong>
                    </div>
                    <span className="role-pill">
                      {roles[i] ? ROLE_LABELS[roles[i]!.role] : "Member"}
                    </span>
                  </div>
                  <div className="muted">Open workspace →</div>
                </Link>
              ))
            )}
          </div>

          <section className="panel">
            <h1 style={{ fontSize: "1.3rem" }}>New workspace</h1>
            <p className="lead">Give it a name and a brand color.</p>
            <form className="form" action={createWorkspaceAction}>
              <label>
                Name
                <input name="name" required placeholder="Product Team" maxLength={60} />
              </label>
              <label>
                Accent color
                <input type="color" name="accent" defaultValue="#2563eb" />
              </label>
              <div className="swatch-row">
                {ACCENT_PRESETS.map((p) => (
                  <span
                    key={p.value}
                    className="swatch"
                    title={p.name}
                    style={{ background: p.value }}
                    aria-hidden
                  />
                ))}
              </div>
              <SubmitButton>Create workspace</SubmitButton>
            </form>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
