import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <section className="hero-auth">
      <div className="auth-card" style={{ width: "min(640px, 100%)" }}>
        <p className="brand-sub">Hult Cohort · Summer Pilot 2026</p>
        <h1 className="landing-brand">Pilot</h1>
        <p className="landing-copy">
          The project board built for this cohort: clear next actions, visible
          progress, and deadlines that make people want to ship.
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
    </section>
  );
}
