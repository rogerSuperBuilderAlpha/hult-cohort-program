import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionToken } from "@/lib/session";
import { COURSE_MODULES, APP_NAME, TOTAL_LESSONS as TOTAL_LESSONS_SUM } from "@/lib/content";
import { DashboardProgress } from "@/components/CourseProgress";

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
        <p className="text-muted">
          Pick up where you left off — {COURSE_MODULES.length} modules, {TOTAL_LESSONS_SUM} lessons.
        </p>
      </header>

        <DashboardProgress
        modules={COURSE_MODULES.map((m) => ({
          slug: m.slug,
          title: m.title,
          tagline: m.tagline,
          lessons: m.lessons.map((l) => ({ slug: l.slug, title: l.title })),
        }))}
      />
    </main>
  );
}