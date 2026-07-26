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

  return withShell(user, `/app/dm/${id}`, (
    <section className="panel chat-panel">
      <header className="chat-header">
        <p className="muted">Direct message</p>
        <h1>@{peer?.username ?? "peer"}</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          {peer?.name ?? "Cohort member"}
        </p>
      </header>

      <MessagePane initialMessages={messages} conversationId={id} />

      <form className="composer" action={sendDmMessageAction}>
        <input type="hidden" name="conversationId" value={id} />
        <label htmlFor="body" className="muted">
          Message @{peer?.username ?? "peer"}
        </label>
        <textarea
          id="body"
          name="body"
          required
          maxLength={4000}
          placeholder="Write a private message…"
        />
        <SubmitButton>Send</SubmitButton>
      </form>
    </section>
  ));
}
