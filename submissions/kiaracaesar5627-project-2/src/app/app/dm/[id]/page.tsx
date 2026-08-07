import { redirect } from "next/navigation";
import { sendDmMessageAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import {
  getConversationForUser,
  listConversationMessages,
  listDmConversations,
} from "@/lib/db";
import { withShell } from "@/lib/shell";
import { MessagePane } from "@/components/MessagePane";
import { SubmitButton } from "@/components/SubmitButton";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default async function DmThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const conversation = await getConversationForUser(id, user.id);
  if (!conversation) redirect("/app/dm");

  const [messages, dms] = await Promise.all([
    listConversationMessages(id),
    listDmConversations(user.id),
  ]);
  const peer = dms.find((row) => row.conversation.id === id)?.peer;
  const peerName = peer?.name ?? "Cohort member";
  const peerUsername = peer?.username ?? "peer";

  const rail = (
    <div className="rail-stack">
      <section className="rail-block">
        <h2 className="rail-title">Conversation</h2>
        <div className="user-chip">
          <span className="avatar" aria-hidden="true">
            {initials(peerName)}
          </span>
          <div className="user-chip-text">
            <strong>{peerName}</strong>
            <div className="muted">@{peerUsername}</div>
          </div>
        </div>
        <p className="muted" style={{ marginTop: "0.75rem" }}>
          Private 1:1 messages stay between you two.
        </p>
      </section>
    </div>
  );

  return withShell(
    user,
    `/app/dm/${id}`,
    <section className="feed-panel">
      <header className="feed-header">
        <div>
          <p className="muted">Direct message</p>
          <h1>{peerName}</h1>
          <p className="lead">@{peerUsername}</p>
        </div>
      </header>

      <MessagePane initialMessages={messages} conversationId={id} />

      <form className="composer" action={sendDmMessageAction}>
        <input type="hidden" name="conversationId" value={id} />
        <label htmlFor="body" className="sr-only">
          Message @{peerUsername}
        </label>
        <textarea
          id="body"
          name="body"
          required
          maxLength={4000}
          placeholder={`Message @${peerUsername}…`}
        />
        <div className="composer-actions">
          <SubmitButton>Send</SubmitButton>
        </div>
      </form>
    </section>,
    rail,
  );
}
