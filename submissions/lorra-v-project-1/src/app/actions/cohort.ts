"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startOfWeek } from "@/lib/civilization";
import type { ContributionType, PrStatus } from "@/lib/types";

export async function submitPullRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const github_url = String(formData.get("github_url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "pending") as PrStatus;
  const reviewer_count = Number(formData.get("reviewer_count") ?? 0);

  if (!github_url || !title) {
    redirect("/submit?error=" + encodeURIComponent("PR URL and title are required."));
  }

  const { error } = await supabase.from("pull_requests").insert({
    profile_id: user.id,
    github_url,
    title,
    status: status === "merged" ? "merged" : "pending",
    reviewer_count: Number.isFinite(reviewer_count) ? Math.max(0, reviewer_count) : 0,
  });

  if (error) {
    redirect(`/submit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath(`/profile/${user.id}`);
  redirect("/submit?ok=pr");
}

export async function submitContribution(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const type = String(formData.get("type") ?? "") as ContributionType;
  const description = String(formData.get("description") ?? "").trim();
  const allowed: ContributionType[] = [
    "doc",
    "design",
    "pm_task",
    "issue_resolved",
    "feedback_addressed",
  ];

  if (!allowed.includes(type) || !description) {
    redirect("/submit?error=" + encodeURIComponent("Contribution type and description required."));
  }

  const { error } = await supabase.from("contributions").insert({
    profile_id: user.id,
    type,
    description,
  });

  if (error) {
    redirect(`/submit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/leaderboard");
  revalidatePath(`/profile/${user.id}`);
  redirect("/submit?ok=contribution");
}

export async function castVote(recipientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (user.id === recipientId) {
    redirect(`/profile/${recipientId}?error=` + encodeURIComponent("Cannot vote for yourself."));
  }

  // One vote per (voter, recipient); re-vote updates the same row
  const { error } = await supabase.from("votes").upsert(
    {
      voter_id: user.id,
      recipient_id: recipientId,
      created_at: new Date().toISOString(),
    },
    { onConflict: "voter_id,recipient_id" },
  );

  if (error) {
    redirect(`/profile/${recipientId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/profile/${recipientId}`);
  revalidatePath("/leaderboard");
  redirect(`/profile/${recipientId}?ok=vote`);
}

export async function updateMvpStatus(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const feature_completion_pct = Number(formData.get("feature_completion_pct") ?? 0);
  const critical_bugs_open = Number(formData.get("critical_bugs_open") ?? 0);
  const e2e_flow_implemented = formData.get("e2e_flow_implemented") === "on";

  const { data: existing } = await supabase.from("mvp_status").select("id").limit(1).maybeSingle();

  const payload = {
    feature_completion_pct: Math.min(100, Math.max(0, feature_completion_pct)),
    critical_bugs_open: Math.max(0, Math.floor(critical_bugs_open)),
    e2e_flow_implemented,
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  };

  const { error } = existing
    ? await supabase.from("mvp_status").update(payload).eq("id", existing.id)
    : await supabase.from("mvp_status").insert(payload);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/ascend");
  revalidatePath("/admin");
  redirect("/admin?ok=1");
}

export async function markWeeklyActive() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const week_start = startOfWeek();
  const { error } = await supabase.from("weekly_activity").upsert(
    {
      profile_id: user.id,
      week_start,
      active: true,
    },
    { onConflict: "profile_id,week_start" },
  );

  if (error) {
    redirect(`/submit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/ascend");
  redirect("/submit?ok=active");
}
