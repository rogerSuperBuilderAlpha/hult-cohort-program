import Link from "next/link";
import { notFound } from "next/navigation";
import { DisciplineClient } from "@/app/paths/DisciplineClient";
import { requireSession } from "@/lib/auth/session";
import { parseProgressAnswers } from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/admin";

type PageProps = {
  params: Promise<{ pathSlug: string; disciplineSlug: string }>;
};

type ScenarioOption = { key: string; text: string; score?: number };

export default async function DisciplinePage({ params }: PageProps) {
  const session = await requireSession();
  if (!session) notFound();

  const { pathSlug, disciplineSlug } = await params;
  const supabase = createAdminClient();

  const { data: path } = await supabase
    .from("paths")
    .select("id, slug, title")
    .eq("slug", pathSlug)
    .maybeSingle();
  if (!path) notFound();

  const { data: discipline } = await supabase
    .from("disciplines")
    .select(
      "id, slug, title, subtitle, content_md, central_question, is_full_module, path_id",
    )
    .eq("slug", disciplineSlug)
    .eq("path_id", path.id)
    .maybeSingle();
  if (!discipline) notFound();

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("id, kind, prompt_md, options, correct_key, explanation")
    .eq("discipline_id", discipline.id);

  const { data: progress } = await supabase
    .from("progress")
    .select("started_at, completed_at, knowledge_score, scenario_response")
    .eq("user_id", session.userId)
    .eq("discipline_id", discipline.id)
    .maybeSingle();

  const parsed = parseProgressAnswers(progress?.scenario_response);

  const scenarioViews = (scenarios ?? []).map((s) => ({
    id: s.id,
    kind: s.kind,
    prompt_md: s.prompt_md,
    options: (s.options ?? []) as ScenarioOption[],
    correct_key: s.correct_key,
    explanation: s.explanation ?? "",
  }));

  return (
    <main style={{ maxWidth: "44rem", margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <p style={{ marginBottom: "1rem" }}>
        <Link href="/paths">← Paths</Link>
      </p>
      <p style={{ color: "var(--tef-muted)", marginBottom: "0.35rem" }}>{path.title}</p>
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>{discipline.title}</h1>
        <span
          className={
            discipline.is_full_module
              ? "tef-badge tef-badge-full"
              : "tef-badge tef-badge-preview"
          }
        >
          {discipline.is_full_module ? "Full module" : "Preview"}
        </span>
      </div>
      {discipline.subtitle ? (
        <p style={{ color: "var(--tef-muted)", marginTop: "0.5rem" }}>
          {discipline.subtitle}
        </p>
      ) : null}

      <div style={{ marginTop: "2rem" }}>
        <DisciplineClient
          disciplineId={discipline.id}
          isFullModule={discipline.is_full_module}
          contentMd={discipline.content_md}
          centralQuestion={discipline.central_question}
          scenarios={scenarioViews}
          initialAnswers={parsed.answers ?? {}}
          initialContentViewed={Boolean(parsed.contentViewed)}
          initialKnowledgeScore={progress?.knowledge_score ?? null}
          initialCompletedAt={progress?.completed_at ?? null}
        />
      </div>
    </main>
  );
}
