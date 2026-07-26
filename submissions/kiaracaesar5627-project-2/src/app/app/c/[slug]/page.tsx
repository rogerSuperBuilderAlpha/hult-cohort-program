import { redirect } from "next/navigation";
import {
  archiveChannelAction,
  renameChannelAction,
  sendChannelMessageAction,
} from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { getChannelBySlug, listChannelMessages } from "@/lib/db";
import { withShell } from "@/lib/shell";
import { MessagePane } from "@/components/MessagePane";
import { SubmitButton } from "@/components/SubmitButton";

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { slug } = await params;
  const channel = await getChannelBySlug(slug);
  if (!channel || channel.archived) redirect("/app");

  const messages = await listChannelMessages(channel.id);
  const canPost =
    channel.kind !== "announcements" || user.role === "ADMIN";

  return withShell(user, `/app/c/${channel.slug}`, (
    <section className="panel chat-panel">
      <header className="chat-header">
        <p className="muted">
          #{channel.name}
          {channel.kind === "announcements" ? " · announcements" : ""}
        </p>
        <h1>#{channel.name}</h1>
        <p className="lead" style={{ marginBottom: 0 }}>
          {channel.description || "Public channel"}
        </p>
        {user.role === "ADMIN" && channel.kind !== "announcements" ? (
          <div className="cta-row">
            <form className="form" action={renameChannelAction} style={{ maxWidth: 360 }}>
              <input type="hidden" name="channelId" value={channel.id} />
              <label>
                Rename channel
                <input name="name" defaultValue={channel.name} required />
              </label>
              <SubmitButton className="btn-secondary">Save name</SubmitButton>
            </form>
            <form action={archiveChannelAction}>
              <input type="hidden" name="channelId" value={channel.id} />
              <input type="hidden" name="archived" value="true" />
              <SubmitButton className="ghost-btn">Archive channel</SubmitButton>
            </form>
          </div>
        ) : null}
      </header>

      <MessagePane initialMessages={messages} channelId={channel.id} />

      {canPost ? (
        <form className="composer" action={sendChannelMessageAction}>
          <input type="hidden" name="channelId" value={channel.id} />
          <label htmlFor="body" className="muted">
            Message #{channel.name}
          </label>
          <textarea
            id="body"
            name="body"
            required
            maxLength={4000}
            placeholder="Write a message… Use @username to mention someone."
          />
          <SubmitButton>Send</SubmitButton>
        </form>
      ) : (
        <p className="muted">Only admins can post in #announcements.</p>
      )}
    </section>
  ));
}
