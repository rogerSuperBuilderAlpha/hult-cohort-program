import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/app");

  return (
    <main className="landing">
      <div className="landing-card">
        <p className="muted">Hult Cohort · Project 2</p>
        <h1>Comms</h1>
        <p className="lead">
          A focused communications platform for the cohort — channels, direct
          messages, staff announcements, search, and live updates without a
          manual refresh.
        </p>
        <ul className="feature-list">
          <li>Public channels with create / rename / archive</li>
          <li>1:1 DMs between any two members</li>
          <li>Admin-only #announcements</li>
          <li>Keyword search across 30+ days of history</li>
        </ul>
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
