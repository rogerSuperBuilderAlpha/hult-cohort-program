import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitButton } from "@/components/SubmitButton";
import {
  addMemberAction,
  removeMemberAction,
  updateMemberRoleAction,
} from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { listMembers } from "@/lib/db";
import { ASSIGNABLE_ROLES, ROLE_LABELS, canManageWorkspace } from "@/lib/roles";
import { getShellData } from "@/lib/workspace-server";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shell = await getShellData(id);
  if (!shell) {
    const user = await getSessionUser();
    redirect(user ? "/workspaces" : "/login");
  }
  const { user, workspace, role, workspaces, unread } = shell;

  const members = await listMembers(id);
  const canManage = canManageWorkspace(role);

  return (
    <AppShell
      user={user}
      workspace={workspace}
      role={role}
      workspaces={workspaces}
      unread={unread}
      active="members"
    >
      <div className="grid-2">
        <section className="stack">
          <div>
            <p className="brand-sub">Team</p>
            <h1>Members &amp; roles</h1>
            <p className="lead">
              Roles: Owner &gt; Admin &gt; Manager &gt; Member &gt; Guest. Admins
              manage settings and people; Managers run projects; Members work
              tasks; Guests view.
            </p>
          </div>
          <div className="task-list">
            {members.map((m) => {
              const isOwner = m.user_id === workspace.owner_id;
              return (
                <div key={m.user_id} className="card-row">
                  <div className="row-split">
                    <div>
                      <strong>{m.user?.name ?? m.user_id}</strong>
                      <div className="task-meta">@{m.user?.username ?? m.user_id}</div>
                    </div>
                    <span className="role-pill">{ROLE_LABELS[m.role]}</span>
                  </div>
                  {canManage && !isOwner ? (
                    <div className="split">
                      <form action={updateMemberRoleAction} className="split">
                        <input type="hidden" name="workspaceId" value={id} />
                        <input type="hidden" name="userId" value={m.user_id} />
                        <select name="role" defaultValue={m.role} style={{ width: "auto" }}>
                          {ASSIGNABLE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                        <SubmitButton className="ghost-btn">Update</SubmitButton>
                      </form>
                      <form action={removeMemberAction}>
                        <input type="hidden" name="workspaceId" value={id} />
                        <input type="hidden" name="userId" value={m.user_id} />
                        <SubmitButton className="danger-btn">Remove</SubmitButton>
                      </form>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {canManage ? (
          <section className="panel">
            <h1 style={{ fontSize: "1.3rem" }}>Invite a member</h1>
            <p className="lead">
              Add an existing FlexiFlow user by email or username.
            </p>
            <form className="form" action={addMemberAction}>
              <input type="hidden" name="workspaceId" value={id} />
              <label>
                Email or username
                <input name="identifier" required placeholder="ada or ada@team.com" />
              </label>
              <label>
                Role
                <select name="role" defaultValue="MEMBER">
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </label>
              <SubmitButton>Add member</SubmitButton>
            </form>
          </section>
        ) : (
          <section className="panel soon">
            <h1 style={{ fontSize: "1.3rem" }}>Invite a member</h1>
            <p className="muted">Only Admins and the Owner can manage members.</p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
