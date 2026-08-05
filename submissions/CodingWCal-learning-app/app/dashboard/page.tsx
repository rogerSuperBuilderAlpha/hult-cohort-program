import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { readSessionToken } from "@/lib/session";
import { COURSE_MODULES, APP_NAME } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const store = await cookies();
  const token = store.get("ai-onramp-session")?.value;
  const user = token ? await readSessionToken(token) : null;
  if (!user) redirect("/");

  return (
    <main className="flex-1 px-8 max-md:px-5 py-12">
      <header className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">
          {APP_NAME} · Dashboard
        </p>
        <h1 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-[-0.02em] mb-2">
          Welcome back
          {user.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-muted">Pick up where you left off — {COURSE_MODULES.length} modules.</p>
      </header>

      <ol className="grid gap-6 md:grid-cols-2">
        {COURSE_MODULES.map((m, i) => (
          <li
            key={m.slug}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <p className="text-xs font-semibold text-muted mb-2">
              Module {i + 1} of {COURSE_MODULES.length}
            </p>
            <h2 className="text-xl font-semibold mb-3">{m.title}</h2>
            <p className="text-sm text-muted mb-6">{m.tagline}</p>
            <ul className="space-y-2">
              {m.lessons.map((l, li) => (
                <li key={l.slug}>
                  <Link
                    href={`/learn/${m.slug}/${l.slug}`}
                    className="block rounded-lg border border-border bg-surface-2 px-4 py-3 text-sm transition hover:border-accent/60"
                  >
                    <span className="mr-2 text-muted">
                      {i + 1}.{li + 1}
                    </span>
                    {l.title}
                    <span className="ml-2 text-xs text-muted">· {l.minutes} min</span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </main>
  );
}