import { redirect } from "next/navigation";
import {
  archiveChannelAction,
  renameChannelAction,
  sendChannelMessageAction,
} from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { channelLabel } from "@/lib/channels";
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
  const label = channelLabel(channel);

  const rail = (
    <div className="rail-stack">
      <section className="rail-block">
        <h2 className="rail-title">About</h2>
        <p className="rail-channel-name">{label}</p>
        <p className="muted">
          {channel.description || "Public channel for the cohort."}
        </p>
        {channel.kind === "announcements" ? (
          <p className="rail-note">Staff-only posting</p>
        ) : null}
      </section>
      <section className="rail-block">
        <h2 className="rail-title">Quick links</h2>
        <ul className="rail-tips">
          <li>Mention people with @username</li>
          <li>Search from the Channels list</li>
          <li>Open FlexiFlow from the left nav for tasks</li>
        </ul>
      </section>
    </div>
  );

  return withShell(
    user,
    `/app/c/${channel.slug}`,
    <section className="feed-panel">
      <header className="feed-header">
        <div>
          <p className="muted">
            {channel.kind === "announcements" ? "Staff channel" : "Channel"}
          </p>
          <h1>{label}</h1>
          <p className="lead">
            {channel.description || "Share updates with the cohort."}
          </p>
        </div>
        {user.role === "ADMIN" && channel.kind !== "announcements" ? (
          <div className="admin-tools">
            <form className="form" action={renameChannelAction}>
              <input type="hidden" name="channelId" value={channel.id} />
              <label>
                Rename
                <input name="name" defaultValue={channel.name} required />
              </label>
              <SubmitButton className="btn-secondary">Save</SubmitButton>
            </form>
            <form action={archiveChannelAction}>
              <input type="hidden" name="channelId" value={channel.id} />
              <input type="hidden" name="archived" value="true" />
              <SubmitButton className="ghost-btn">Archive</SubmitButton>
            </form>
          </div>
        ) : null}
      </header>

      <MessagePane initialMessages={messages} channelId={channel.id} />

      {canPost ? (
        <form className="composer" action={sendChannelMessageAction}>
          <input type="hidden" name="channelId" value={channel.id} />
          <label htmlFor="body" className="sr-only">
            Post to {label}
          </label>
          <textarea
            id="body"
            name="body"
            required
            maxLength={4000}
            placeholder={`Post in ${label}… Use @username to mention someone.`}
          />
          <div className="composer-actions">
            <SubmitButton>Post</SubmitButton>
          </div>
        </form>
      ) : (
        <p className="muted composer-locked">
          Only admins can post in Announcements.
        </p>
      )}
    </section>,
    rail,
  );
}
