import Link from "next/link";
import { APP_TAGLINE, COURSE_MODULES, TOTAL_LESSONS } from "@/lib/content";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="px-8 max-md:px-5 pt-[clamp(4rem,10vw,8rem)] pb-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">
            A hands-on course on AI &amp; machine learning
          </p>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-6">
            Understand AI. Apply it. Stay ethical.
          </h1>
          <p className="text-lg leading-relaxed text-muted max-w-xl mb-8">
            {APP_TAGLINE} {TOTAL_LESSONS} short lessons across {COURSE_MODULES.length} modules
            — no math degree required.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center rounded-full bg-accent px-6 text-sm font-semibold text-background transition hover:brightness-110"
          >
            Start learning
          </Link>
        </div>
      </section>

      <section className="px-8 max-md:px-5 pb-20 grid gap-8 md:grid-cols-3">
        {COURSE_MODULES.map((m) => (
          <Link
            key={m.slug}
            href="/dashboard"
            className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/60"
          >
            <h2 className="text-lg font-semibold mb-2 group-hover:text-accent">
              {m.title}
            </h2>
            <p className="text-sm text-muted leading-relaxed">{m.tagline}</p>
            <p className="mt-4 text-xs text-muted">
              {m.lessons.length} lesson{m.lessons.length === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}