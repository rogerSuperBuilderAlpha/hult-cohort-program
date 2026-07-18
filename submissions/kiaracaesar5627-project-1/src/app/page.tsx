import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

const HIGHLIGHTS = [
  { title: "Custom statuses", body: "Design your own workflow — not locked to To-do/Done." },
  { title: "Your own fields", body: "Text, number, date, dropdown or checkbox on any task." },
  { title: "List · Board · Calendar", body: "Switch views to match the moment." },
  { title: "Toggle features", body: "Turn on only what your team needs." },
];

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) redirect("/workspaces");

  return (
    <main className="landing">
      <div className="landing-wrap">
        <div>
          <span className="eyebrow">Project management, your way</span>
          <h1 className="landing-brand">
            FlexiFlow
          </h1>
          <p className="landing-copy">
            A project platform that adapts to your team. Build workspaces, define
            your own statuses, labels, and fields, pick the views you like, and
            automate the busywork — without being forced into someone else&apos;s
            rigid system.
          </p>
          <div className="cta-row">
            <Link className="btn" href="/register">
              Create your workspace
            </Link>
            <Link className="btn btn-secondary" href="/login">
              Sign in
            </Link>
          </div>
        </div>
        <div className="feature-grid">
          {HIGHLIGHTS.map((h) => (
            <div className="feature-chip" key={h.title}>
              <strong>{h.title}</strong>
              <span>{h.body}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
