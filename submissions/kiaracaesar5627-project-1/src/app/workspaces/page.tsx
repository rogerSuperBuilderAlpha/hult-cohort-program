import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import { createWorkspaceAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { getMembership } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/roles";
import { ACCENT_PRESETS } from "@/lib/theme";
import { getGlobalShellData } from "@/lib/workspace-server";

export default async function WorkspacesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const shell = await getGlobalShellData(user);
  const { workspaces } = shell;

  const roles = await Promise.all(
    workspaces.map((w) => getMembership(w.id, user.id)),
  );

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
              <div className="empty">Create your first workspace to begin.</div>
            ) : (
              workspaces.map((w, i) => (
                <Link key={w.id} href={`/w/${w.id}`} className="project-card">
                  <div className="row-split">
                    <strong style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        className="dot"
                        style={{ background: w.accent_color }}
                        aria-hidden
                      />
                      {w.name}
                    </strong>
                    <span className="soon-tag">
                      {ROLE_LABELS[roles[i]?.role ?? "MEMBER"]}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <section className="panel">
            <h1 style={{ fontSize: "1.2rem" }}>New workspace</h1>
            <form className="form" action={createWorkspaceAction}>
              <label>
                Name
                <input name="name" required placeholder="Product squad" />
              </label>
              <label>
                Accent
                <select name="accent" defaultValue={ACCENT_PRESETS[0].value}>
                  {ACCENT_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <SubmitButton>Create workspace</SubmitButton>
            </form>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
