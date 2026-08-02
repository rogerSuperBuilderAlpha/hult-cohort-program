"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  buildAmplificationUserPrompt,
  generateAmplificationCopy,
} from "@/lib/ai/generate-amplification";
import { logAnalyticsEvent } from "@/lib/analytics";
import { requireUser } from "@/lib/auth/session";
import { COHORT_SLUG } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export type AmplifyActionState = {
  error?: string;
  success?: string;
} | null;

function isRedirectError(err: unknown): boolean {
  const digest =
    err && typeof err === "object" && "digest" in err
      ? String((err as { digest?: string }).digest ?? "")
      : "";
  return digest.startsWith("NEXT_REDIRECT");
}

async function getBoostableCampaign(campaignId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(
      "id, creator_id, project_id, status, story_angle, why_angle_matters, core_message, evidence, call_to_action, project:projects!campaigns_project_id_fkey(id, name, slug, status), creator:profiles!campaigns_creator_id_fkey(id, name)",
    )
    .eq("id", campaignId)
    .eq("status", "approved")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  if (data.creator_id === userId) return null;

  const project = data.project as unknown as {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
  if (!project || project.status !== "published") return null;

  return {
    ...data,
    project,
    creator: data.creator as unknown as {
      id: string;
      name: string | null;
    } | null,
  };
}

export async function draftAmplificationAction(
  campaignId: string,
): Promise<AmplifyActionState> {
  const { user, profile } = await requireUser();

  try {
    const campaign = await getBoostableCampaign(campaignId, user.id);
    if (!campaign) {
      return { error: "That campaign isn’t available to boost." };
    }

    const supabase = await createClient();
    const { data: cohort } = await supabase
      .from("cohorts")
      .select("name, mission, tagline")
      .eq("slug", COHORT_SLUG)
      .maybeSingle();

    if (!cohort) {
      return { error: "Cohort seed missing. Re-run 001_schema.sql." };
    }

    const prompt = buildAmplificationUserPrompt({
      cohortName: cohort.name as string,
      cohortMission: (cohort.mission as string | null) ?? null,
      cohortTagline: (cohort.tagline as string | null) ?? null,
      amplifier: {
        name: profile.name,
        biography: profile.biography,
        skills: profile.skills ?? [],
        interests: profile.interests ?? [],
      },
      builderName: campaign.creator?.name ?? null,
      projectName: campaign.project.name,
      campaign: {
        story_angle: campaign.story_angle,
        why_angle_matters: campaign.why_angle_matters,
        core_message: campaign.core_message,
        evidence: (campaign.evidence as string[]) ?? [],
        call_to_action: campaign.call_to_action,
      },
    });

    const output = await generateAmplificationCopy(prompt);

    const { data: existing } = await supabase
      .from("amplifications")
      .select("id, status")
      .eq("campaign_id", campaignId)
      .eq("participant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.status === "shared") {
      return {
        error:
          "You’ve already shared a boost for this campaign. Pick another builder.",
      };
    }

    if (existing) {
      const { error } = await supabase
        .from("amplifications")
        .update({
          content: output.endorsement,
          status: "draft",
          shared_at: null,
        })
        .eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("amplifications").insert({
        campaign_id: campaignId,
        participant_id: user.id,
        content: output.endorsement,
        status: "draft",
      });
      if (error) return { error: error.message };
    }

    revalidatePath("/dashboard/amplify");
    revalidatePath(`/dashboard/amplify/${campaignId}`);
    redirect(`/dashboard/amplify/${campaignId}`);
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const message =
      err instanceof Error
        ? err.message
        : "Couldn’t draft an endorsement. Please try again.";
    if (message.includes("ANTHROPIC_API_KEY")) {
      return {
        error:
          "Anthropic API key is missing. Add ANTHROPIC_API_KEY to .env.local and restart the server.",
      };
    }
    return { error: message };
  }
}

export async function updateAmplificationAction(
  amplificationId: string,
  content: string,
): Promise<AmplifyActionState> {
  const { user } = await requireUser();
  const trimmed = content.trim();
  if (!trimmed) return { error: "Endorsement can’t be empty." };

  const supabase = await createClient();
  const { data: row, error: fetchError } = await supabase
    .from("amplifications")
    .select("id, campaign_id, status, participant_id")
    .eq("id", amplificationId)
    .eq("participant_id", user.id)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!row) return { error: "Boost not found." };
  if (row.status === "shared") {
    return { error: "This boost was already shared — create a new campaign boost instead." };
  }

  const { error } = await supabase
    .from("amplifications")
    .update({ content: trimmed })
    .eq("id", amplificationId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/amplify/${row.campaign_id}`);
  return { success: "Draft saved." };
}

export async function shareAmplificationAction(
  amplificationId: string,
  content: string,
): Promise<AmplifyActionState> {
  const { user } = await requireUser();
  const trimmed = content.trim();
  if (!trimmed) return { error: "Endorsement can’t be empty." };

  const supabase = await createClient();
  const { data: row, error: fetchError } = await supabase
    .from("amplifications")
    .select("id, campaign_id, status, participant_id")
    .eq("id", amplificationId)
    .eq("participant_id", user.id)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!row) return { error: "Boost not found." };

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("project_id, project:projects!campaigns_project_id_fkey(slug)")
    .eq("id", row.campaign_id)
    .maybeSingle();

  const { error } = await supabase
    .from("amplifications")
    .update({
      content: trimmed,
      status: "shared",
      shared_at: new Date().toISOString(),
    })
    .eq("id", amplificationId);

  if (error) return { error: error.message };

  const project = campaign?.project as { slug: string } | null | undefined;

  await logAnalyticsEvent({
    eventType: "amplification_action",
    campaignId: row.campaign_id,
    projectId: campaign?.project_id ?? null,
    metadata: {
      amplification_id: amplificationId,
      participant_id: user.id,
    },
  });

  revalidatePath("/dashboard/amplify");
  revalidatePath(`/dashboard/amplify/${row.campaign_id}`);
  if (project?.slug) {
    revalidatePath(`/projects/${project.slug}`);
  }

  return { success: "Boost marked as shared." };
}
