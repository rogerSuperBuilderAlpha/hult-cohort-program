import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth";
import { withShell } from "@/lib/shell";

export default async function ProfilePage() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  return withShell(
    user,
    "/app/profile",
    <section className="feed-panel feed-panel-solo stack">
      <header className="feed-header">
        <div>
          <p className="muted">Account</p>
          <h1>Profile</h1>
          <p className="lead">
            Update how you appear in channels and direct messages.
          </p>
        </div>
      </header>
      <ProfileForm user={user} />
    </section>,
  );
}
