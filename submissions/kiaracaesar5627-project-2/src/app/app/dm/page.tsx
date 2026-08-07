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

  return withShell(
    user,
    "/app/dm",
    <section className="feed-panel feed-panel-solo">
      <header className="feed-header">
        <div>
          <p className="muted">Messages</p>
          <h1>Message someone</h1>
          <p className="lead">Start or reopen a 1:1 conversation.</p>
        </div>
      </header>
      <div className="member-list">
        {peers.map((peer) => (
          <form key={peer.id} action={startDmAction}>
            <input type="hidden" name="peerId" value={peer.id} />
            <div className="user-chip">
              <span className="avatar" aria-hidden="true">
                {peer.name
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase() || "?"}
              </span>
              <div className="user-chip-text">
                <strong>{peer.name}</strong>
                <div className="muted">@{peer.username}</div>
              </div>
            </div>
            <SubmitButton className="btn-secondary">Message</SubmitButton>
          </form>
        ))}
      </div>
    </section>,
  );
}
