import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getChannelById, searchMessages } from "@/lib/db";
import { withShell } from "@/lib/shell";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchMessages(q.trim()) : [];

  const enriched = await Promise.all(
    results.map(async (message) => {
      if (!message.channel_id) {
        return {
          message,
          href: message.conversation_id
            ? `/app/dm/${message.conversation_id}`
            : "/app",
          context: "Direct message",
        };
      }
      const channel = await getChannelById(message.channel_id);
      return {
        message,
        href: channel ? `/app/c/${channel.slug}` : "/app",
        context: channel ? `#${channel.name}` : "Channel",
      };
    }),
  );

  return withShell(user, "/app/search", (
    <section className="panel stack">
      <div>
        <p className="muted">Search</p>
        <h1>Find messages</h1>
        <p className="lead">Keyword search across the last 30 days of history.</p>
      </div>
      <form className="form" method="get">
        <label>
          Keyword
          <input name="q" defaultValue={q} placeholder="deadline, review, standup…" />
        </label>
        <button type="submit">Search</button>
      </form>
      <div className="result-list">
        {q && enriched.length === 0 ? (
          <div className="empty">No matches for “{q}”.</div>
        ) : null}
        {enriched.map(({ message, href, context }) => (
          <Link key={message.id} href={href}>
            <div>
              <strong>
                @{message.author?.username ?? "someone"} · {context}
              </strong>
              <div className="muted">{message.body}</div>
            </div>
            <span className="muted">
              {new Date(message.created_at).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </section>
  ));
}
