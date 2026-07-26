import { redirect } from "next/navigation";
import { startDmAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { listUsersPublic } from "@/lib/db";
import { withShell } from "@/lib/shell";
import { SubmitButton } from "@/components/SubmitButton";

export default async function DmPickerPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const peers = (await listUsersPublic()).filter((peer) => peer.id !== user.id);

  return withShell(user, "/app/dm", (
    <section className="panel" style={{ maxWidth: 560 }}>
      <p className="muted">Direct messages</p>
      <h1>Message a cohort member</h1>
      <p className="lead">Start or reopen a 1:1 conversation.</p>
      <div className="member-list">
        {peers.map((peer) => (
          <form key={peer.id} action={startDmAction}>
            <input type="hidden" name="peerId" value={peer.id} />
            <div>
              <strong>{peer.name}</strong>
              <div className="muted">@{peer.username}</div>
            </div>
            <SubmitButton className="btn-secondary">Message</SubmitButton>
          </form>
        ))}
      </div>
    </section>
  ));
}
