import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

type DisciplineLink = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  sort_order: number;
  is_full_module: boolean;
};

type PathRow = {
  id: string;
  slug: string;
  title: string;
  sort_order: number;
  disciplines: DisciplineLink[] | null;
};

export default async function PathsPage() {
  const session = await requireSession();
  if (!session) redirect("/launch");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("paths")
    .select(
      "id, slug, title, sort_order, disciplines(id, slug, title, subtitle, sort_order, is_full_module)",
    )
    .order("sort_order", { ascending: true });

  if (error) {
    return (
      <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <h1>Paths</h1>
        <p>Failed to load paths: {error.message}</p>
      </main>
    );
  }

  const paths = (data ?? []) as PathRow[];

  return (
    <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <p style={{ marginBottom: "0.5rem" }}>
        <Link href="/">Home</Link>
      </p>
      <h1 style={{ marginBottom: "0.5rem" }}>Learning paths</h1>
      <p style={{ color: "var(--tef-muted)", marginBottom: "2.5rem" }}>
        Three full modules and six previews. Full modules include dilemma,
        recognition, and knowledge checks.
      </p>

      {paths.map((path) => {
        const disciplines = [...(path.disciplines ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        );
        return (
          <section key={path.id} style={{ marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "0.35rem" }}>
              {path.title}
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: "1.25rem 0 0" }}>
              {disciplines.map((d) => (
                <li
                  key={d.id}
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem 1.1rem",
                    background: "var(--tef-surface)",
                    borderLeft: d.is_full_module
                      ? "3px solid var(--tef-accent)"
                      : "3px solid var(--tef-sage)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "baseline",
                      flexWrap: "wrap",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <Link
                      href={`/paths/${path.slug}/${d.slug}`}
                      style={{
                        fontWeight: 600,
                        fontSize: "1.05rem",
                        textDecoration: "none",
                      }}
                    >
                      {d.title}
                    </Link>
                    <span
                      className={
                        d.is_full_module ? "tef-badge tef-badge-full" : "tef-badge tef-badge-preview"
                      }
                    >
                      {d.is_full_module ? "Full module" : "Preview"}
                    </span>
                  </div>
                  {d.subtitle ? (
                    <p style={{ margin: 0, color: "var(--tef-muted)", fontSize: "0.95rem" }}>
                      {d.subtitle}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
