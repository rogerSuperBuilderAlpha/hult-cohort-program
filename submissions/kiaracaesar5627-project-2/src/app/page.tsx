import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSessionUser } from "@/lib/auth";
import { parseTheme, THEME_COOKIE } from "@/lib/theme";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/app");

  const jar = await cookies();
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value);

  return (
    <main className="landing">
      <div className="theme-toggle-corner">
        <ThemeToggle initialTheme={theme} />
      </div>
      <div className="landing-hero">
        <p className="muted">Hult Cohort · Project 2</p>
        <h1 className="landing-brand">Huddle</h1>
        <p className="lead">
          The cohort feed — channels, DMs, staff announcements, and live updates
          in one place.
        </p>
        <div className="cta-row">
          <Link className="btn" href="/register">
            Create account
          </Link>
          <Link className="btn btn-secondary" href="/login">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
