import { createClient } from "@/lib/supabase/server";
import type {
  Contribution,
  MvpStatus,
  Profile,
  Project,
  PullRequest,
  Task,
  Vote,
  WeeklyActivity,
} from "@/lib/types";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile | null) ?? null;
}

export async function loadCohortData() {
  const supabase = await createClient();

  const [
    profiles,
    pullRequests,
    contributions,
    votes,
    mvp,
    weeklyActivity,
    tasks,
    projects,
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("display_name"),
    supabase.from("pull_requests").select("*").order("created_at", { ascending: false }),
    supabase.from("contributions").select("*").order("created_at", { ascending: false }),
    supabase.from("votes").select("*"),
    supabase.from("mvp_status").select("*").limit(1).maybeSingle(),
    supabase.from("weekly_activity").select("*"),
    supabase.from("tasks").select("*").order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
  ]);

  return {
    profiles: (profiles.data ?? []) as Profile[],
    pullRequests: (pullRequests.data ?? []) as PullRequest[],
    contributions: (contributions.data ?? []) as Contribution[],
    votes: (votes.data ?? []) as Vote[],
    mvp: (mvp.data as MvpStatus | null) ?? null,
    weeklyActivity: (weeklyActivity.data ?? []) as WeeklyActivity[],
    tasks: (tasks.data ?? []) as Task[],
    projects: (projects.data ?? []) as Project[],
  };
}
