import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/app");

  return (
    <main className="landing">
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
