"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { sendLudwittEvent } from "@/lib/ludwitt/events";
import {
  parseProgressAnswers,
  serializeProgressAnswers,
} from "@/lib/progress";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = {
  ok: boolean;
  error?: string;
  knowledgeScore?: number | null;
  selectedKey?: string;
};

type DisciplineRow = {
  id: string;
  path_id: string;
  slug: string;
  is_full_module: boolean;
  paths: { slug: string } | { slug: string }[] | null;
};

type ScenarioOption = { key: string; text: string; score?: number };

function pathSlugFrom(row: DisciplineRow): string | null {
  if (!row.paths) return null;
  if (Array.isArray(row.paths)) return row.paths[0]?.slug ?? null;
  return row.paths.slug ?? null;
}

async function getDisciplineContext(
  disciplineId: string,
): Promise<DisciplineRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("disciplines")
    .select("id, path_id, slug, is_full_module, paths(slug)")
    .eq("id", disciplineId)
    .single();

  if (error || !data) return null;
  return data as DisciplineRow;
}

function revalidateDiscipline(row: DisciplineRow) {
  const pathSlug = pathSlugFrom(row);
  if (pathSlug) {
    revalidatePath(`/paths/${pathSlug}/${row.slug}`);
  }
  revalidatePath("/paths");
}

async function loadProgressPayload(
  userId: string,
  disciplineId: string,
): Promise<{
  started_at: string | null;
  completed_at: string | null;
  knowledge_score: number | null;
  answers: ReturnType<typeof parseProgressAnswers>;
}> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("progress")
    .select("started_at, completed_at, knowledge_score, scenario_response")
    .eq("user_id", userId)
    .eq("discipline_id", disciplineId)
    .maybeSingle();

  return {
    started_at: data?.started_at ?? null,
    completed_at: data?.completed_at ?? null,
    knowledge_score: data?.knowledge_score ?? null,
    answers: parseProgressAnswers(data?.scenario_response),
  };
}

async function saveProgressAnswers(
  userId: string,
  disciplineId: string,
  answers: ReturnType<typeof parseProgressAnswers>,
  extra: {
    knowledge_score?: number | null;
    started_at?: string | null;
  } = {},
) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const serialized = serializeProgressAnswers(answers);

  const { data: existing } = await supabase
    .from("progress")
    .select("user_id, started_at")
    .eq("user_id", userId)
    .eq("discipline_id", disciplineId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("progress")
      .update({
        scenario_response: serialized,
        scenario_at: now,
        ...(extra.knowledge_score !== undefined
          ? { knowledge_score: extra.knowledge_score }
          : {}),
      })
      .eq("user_id", userId)
      .eq("discipline_id", disciplineId);
    return error;
  }

  const { error } = await supabase.from("progress").insert({
    user_id: userId,
    discipline_id: disciplineId,
    started_at: extra.started_at ?? now,
    scenario_response: serialized,
    scenario_at: now,
    ...(extra.knowledge_score !== undefined
      ? { knowledge_score: extra.knowledge_score }
      : {}),
  });
  return error;
}

async function computeKnowledgeScore(
  disciplineId: string,
  answers: Record<string, string>,
): Promise<number | null> {
  const supabase = createAdminClient();
  const { data: checks } = await supabase
    .from("scenarios")
    .select("id, correct_key")
    .eq("discipline_id", disciplineId)
    .eq("kind", "knowledge_check");

  if (!checks || checks.length === 0) return null;

  let correct = 0;
  let answered = 0;
  for (const check of checks) {
    const selected = answers[check.id];
    if (!selected) continue;
    answered += 1;
    if (check.correct_key && selected === check.correct_key) correct += 1;
  }

  // Score only when the full knowledge-check group has been answered.
  if (answered < checks.length) return null;
  return Math.round((correct / checks.length) * 100);
}

/** Insert progress + fire lesson_started if this user/discipline has no progress row yet. */
export async function ensureLessonStarted(
  disciplineId: string,
  sessionId: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session) return { ok: false, error: "unauthorized" };

  const supabase = createAdminClient();
  const { data: existing, error: readError } = await supabase
    .from("progress")
    .select("user_id")
    .eq("user_id", session.userId)
    .eq("discipline_id", disciplineId)
    .maybeSingle();

  if (readError) return { ok: false, error: readError.message };
  if (existing) return { ok: true };

  const now = new Date().toISOString();
  const { error: insertError } = await supabase.from("progress").insert({
    user_id: session.userId,
    discipline_id: disciplineId,
    started_at: now,
    scenario_response: serializeProgressAnswers({}),
  });

  if (insertError) {
    if (insertError.code === "23505") return { ok: true };
    return { ok: false, error: insertError.message };
  }

  await sendLudwittEvent(session.ludwittSub, "lesson_started", {
    session_id: sessionId,
    appUserId: session.userId,
    discipline_id: disciplineId,
  });

  const ctx = await getDisciplineContext(disciplineId);
  if (ctx) revalidateDiscipline(ctx);
  return { ok: true };
}

export async function markContentViewed(
  disciplineId: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session) return { ok: false, error: "unauthorized" };

  const current = await loadProgressPayload(session.userId, disciplineId);
  const next = {
    ...current.answers,
    contentViewed: true,
    answers: current.answers.answers ?? {},
  };

  const error = await saveProgressAnswers(
    session.userId,
    disciplineId,
    next,
    { started_at: current.started_at },
  );
  if (error) return { ok: false, error: error.message };

  const ctx = await getDisciplineContext(disciplineId);
  if (ctx) revalidateDiscipline(ctx);
  return { ok: true };
}

export async function submitScenarioAnswer(
  disciplineId: string,
  sessionId: string,
  scenarioId: string,
  selectedKey: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session) return { ok: false, error: "unauthorized" };

  const supabase = createAdminClient();
  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id, discipline_id, kind, options, correct_key")
    .eq("id", scenarioId)
    .eq("discipline_id", disciplineId)
    .maybeSingle();

  if (scenarioError || !scenario) {
    return { ok: false, error: "scenario not found" };
  }

  const options = (scenario.options ?? []) as ScenarioOption[];
  if (!options.some((o) => o.key === selectedKey)) {
    return { ok: false, error: "invalid option" };
  }

  const current = await loadProgressPayload(session.userId, disciplineId);
  const answersMap = { ...(current.answers.answers ?? {}) };
  answersMap[scenarioId] = selectedKey;

  let knowledgeScore = current.knowledge_score;
  if (scenario.kind === "knowledge_check") {
    const computed = await computeKnowledgeScore(disciplineId, answersMap);
    if (computed !== null) {
      // Retakes: keep best score.
      knowledgeScore =
        current.knowledge_score == null
          ? computed
          : Math.max(current.knowledge_score, computed);
    }
  }

  const next = {
    contentViewed: current.answers.contentViewed,
    answers: answersMap,
  };

  const error = await saveProgressAnswers(
    session.userId,
    disciplineId,
    next,
    {
      started_at: current.started_at,
      knowledge_score: knowledgeScore,
    },
  );
  if (error) return { ok: false, error: error.message };

  await sendLudwittEvent(session.ludwittSub, "quiz_submitted", {
    session_id: sessionId,
    appUserId: session.userId,
    discipline_id: disciplineId,
    scenario_id: scenarioId,
    kind: scenario.kind,
    selected_key: selectedKey,
  });

  const ctx = await getDisciplineContext(disciplineId);
  if (ctx) revalidateDiscipline(ctx);

  return {
    ok: true,
    knowledgeScore,
    selectedKey,
  };
}

export async function markLessonComplete(
  disciplineId: string,
  sessionId: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session) return { ok: false, error: "unauthorized" };

  const supabase = createAdminClient();
  const ctx = await getDisciplineContext(disciplineId);
  if (!ctx) return { ok: false, error: "discipline not found" };

  const current = await loadProgressPayload(session.userId, disciplineId);
  if (current.completed_at) return { ok: true };

  if (!current.answers.contentViewed) {
    return { ok: false, error: "View the module content before completing." };
  }

  const { data: scenarios } = await supabase
    .from("scenarios")
    .select("id, kind")
    .eq("discipline_id", disciplineId);

  const answers = current.answers.answers ?? {};

  if (ctx.is_full_module) {
    const dilemma = (scenarios ?? []).find((s) => s.kind === "dilemma");
    if (!dilemma || !answers[dilemma.id]) {
      return { ok: false, error: "Answer the opening dilemma first." };
    }
    if (current.knowledge_score == null || current.knowledge_score < 80) {
      return {
        ok: false,
        error: "Knowledge checks must score at least 80% (best attempt kept).",
      };
    }
  } else {
    const preview = (scenarios ?? []).find((s) => s.kind === "preview_scenario");
    if (!preview || !answers[preview.id]) {
      return { ok: false, error: "Answer the preview scenario first." };
    }
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from("progress").upsert(
    {
      user_id: session.userId,
      discipline_id: disciplineId,
      started_at: current.started_at ?? now,
      completed_at: now,
      knowledge_score: current.knowledge_score,
      scenario_response: serializeProgressAnswers(current.answers),
    },
    { onConflict: "user_id,discipline_id" },
  );
  if (error) return { ok: false, error: error.message };

  await sendLudwittEvent(session.ludwittSub, "lesson_completed", {
    session_id: sessionId,
    appUserId: session.userId,
    discipline_id: disciplineId,
  });

  // Path completion: all disciplines in the path have completed_at.
  const { data: disciplines } = await supabase
    .from("disciplines")
    .select("id")
    .eq("path_id", ctx.path_id);

  const disciplineIds = (disciplines ?? []).map((d) => d.id);
  if (disciplineIds.length > 0) {
    const { data: progressRows } = await supabase
      .from("progress")
      .select("discipline_id, completed_at")
      .eq("user_id", session.userId)
      .in("discipline_id", disciplineIds);

    const completed = new Set(
      (progressRows ?? [])
        .filter((p) => p.completed_at)
        .map((p) => p.discipline_id),
    );

    const allDone = disciplineIds.every((id) => completed.has(id));
    if (allDone) {
      await supabase.from("path_completions").upsert(
        {
          user_id: session.userId,
          path_id: ctx.path_id,
          completed_at: now,
        },
        { onConflict: "user_id,path_id", ignoreDuplicates: true },
      );
    }
  }

  revalidateDiscipline(ctx);
  return { ok: true };
}

export async function sendHeartbeat(
  disciplineId: string,
  sessionId: string,
): Promise<ActionResult> {
  const session = await requireSession();
  if (!session) return { ok: false, error: "unauthorized" };

  await sendLudwittEvent(session.ludwittSub, "session_heartbeat", {
    session_id: sessionId,
    appUserId: session.userId,
    discipline_id: disciplineId,
  });

  return { ok: true };
}
