import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth";
import { withShell } from "@/lib/shell";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

export default async function ProfilePage() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const jar = await cookies();
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value);

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
      <ProfileForm user={user} theme={theme} />
    </section>,
  );
}
