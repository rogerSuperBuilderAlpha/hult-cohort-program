import { redirect } from "next/navigation";
import { createChannelAction } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import { withShell } from "@/lib/shell";
import { SubmitButton } from "@/components/SubmitButton";

export default async function NewChannelPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/app");

  return withShell(
    user,
    "/app/channels/new",
    <section className="feed-panel feed-panel-solo">
      <header className="feed-header">
        <div>
          <p className="muted">Admin</p>
          <h1>Create a channel</h1>
          <p className="lead">
            Public channels are visible to every cohort member.
          </p>
        </div>
      </header>
      <form className="form" action={createChannelAction}>
        <label>
          Name
          <input name="name" required placeholder="reviews" />
        </label>
        <label>
          Description
          <input name="description" placeholder="What is this channel for?" />
        </label>
        <SubmitButton>Create channel</SubmitButton>
      </form>
    </section>,
  );
}
