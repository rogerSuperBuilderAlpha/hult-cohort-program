"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import {
  buildCampaignUserPrompt,
  generateCampaignCopy,
} from "@/lib/ai/generate-campaign";
import { requireUser } from "@/lib/auth/session";
import { COHORT_SLUG } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type {
  Campaign,
  CampaignContent,
  ContentChannel,
  ContentStatus,
} from "@/lib/types/campaign";

export type CopilotActionState = {
  error?: string;
  success?: string;
} | null;

function trackingCode(): string {
  return `cq-${randomBytes(4).toString("hex")}`;
}

async function getOwnedProject(projectId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("owner_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function generateCampaignAction(
  _prev: CopilotActionState,
  formData: FormData,
): Promise<CopilotActionState> {
  const { user } = await requireUser();
  const projectId = String(formData.get("project_id") || "");
  const updateIdRaw = String(formData.get("update_id") || "");
  const updateId = updateIdRaw && updateIdRaw !== "none" ? updateIdRaw : null;

  if (!projectId) return { error: "Pick a project first." };

  try {
    const project = await getOwnedProject(projectId, user.id);
    if (!project) return { error: "Project not found." };

    const supabase = await createClient();

    let update: Record<string, unknown> | null = null;
    if (updateId) {
      const { data: updateRow, error: updateError } = await supabase
        .from("project_updates")
        .select("*")
        .eq("id", updateId)
        .eq("project_id", projectId)
        .maybeSingle();
      if (updateError) return { error: updateError.message };
      if (!updateRow) return { error: "Selected update not found." };
      update = updateRow as Record<string, unknown>;
    } else {
      const { data: latest } = await supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      update = (latest as Record<string, unknown> | null) ?? null;
    }

    const { data: cohort } = await supabase
      .from("cohorts")
      .select("id, name, mission, tagline")
      .eq("slug", COHORT_SLUG)
      .maybeSingle();

    if (!cohort) {
      return { error: "Cohort seed missing. Re-run 001_schema.sql." };
    }

    const prompt = buildCampaignUserPrompt({
      cohortName: cohort.name as string,
      cohortMission: (cohort.mission as string | null) ?? null,
      cohortTagline: (cohort.tagline as string | null) ?? null,
      project: {
        name: project.name,
        tagline: project.tagline,
        summary: project.summary,
        description: project.description,
        problem: project.problem,
        solution: project.solution,
        target_audience: project.target_audience,
        technology_stack: project.technology_stack,
        stage: project.stage,
        needs: project.needs,
        sectors: project.sectors,
        live_url: project.live_url,
        github_url: project.github_url,
      },
      update,
    });

    const output = await generateCampaignCopy(prompt);

    const campaignName = `${project.name as string} — ${output.story_angle.slice(0, 60)}`;
    const code = trackingCode();

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .insert({
        cohort_id: cohort.id,
        project_id: projectId,
        project_update_id: (update?.id as string | undefined) ?? null,
        creator_id: user.id,
        name: campaignName.slice(0, 160),
        story_angle: output.story_angle,
        why_angle_matters: output.why_this_angle_matters,
        audience: output.audience,
        core_message: output.core_message,
        evidence: output.evidence,
        call_to_action: output.call_to_action,
        status: "draft",
        tracking_code: code,
      })
      .select("id")
      .single();

    if (campaignError || !campaign) {
      return { error: campaignError?.message ?? "Could not save campaign." };
    }

    const contentRows: {
      campaign_id: string;
      channel: ContentChannel;
      content: string;
      status: ContentStatus;
    }[] = [
      {
        campaign_id: campaign.id,
        channel: "linkedin",
        content: output.linkedin_post,
        status: "generated",
      },
      {
        campaign_id: campaign.id,
        channel: "x",
        content: output.x_post,
        status: "generated",
      },
      {
        campaign_id: campaign.id,
        channel: "instagram",
        content: output.instagram_caption,
        status: "generated",
      },
      {
        campaign_id: campaign.id,
        channel: "partner_summary",
        content: output.partner_summary,
        status: "generated",
      },
    ];

    const { error: contentError } = await supabase
      .from("campaign_content")
      .insert(contentRows);

    if (contentError) {
      return { error: contentError.message };
    }

    revalidatePath("/dashboard/copilot");
    revalidatePath(`/dashboard/copilot/${campaign.id}`);
    redirect(`/dashboard/copilot/${campaign.id}`);
  } catch (err) {
    const digest =
      err && typeof err === "object" && "digest" in err
        ? String((err as { digest?: string }).digest ?? "")
        : "";
    if (digest.startsWith("NEXT_REDIRECT")) throw err;

    const message =
      err instanceof Error
        ? err.message
        : "Campaign generation failed. Please try again.";
    if (message.includes("ANTHROPIC_API_KEY")) {
      return {
        error:
          "Anthropic API key is missing. Add ANTHROPIC_API_KEY to .env.local and restart the server.",
      };
    }
    return { error: message };
  }
}

export async function updateCampaignContentAction(
  contentId: string,
  content: string,
): Promise<CopilotActionState> {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: row, error: fetchError } = await supabase
    .from("campaign_content")
    .select("id, campaign_id, status, campaigns!inner(creator_id, project_id)")
    .eq("id", contentId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!row) return { error: "Content not found." };

  const campaign = row.campaigns as unknown as {
    creator_id: string;
    project_id: string;
  };
  if (campaign.creator_id !== user.id) return { error: "Not allowed." };

  const { error } = await supabase
    .from("campaign_content")
    .update({
      content: content.trim(),
      status: "edited",
      approved_by: null,
      approved_at: null,
    })
    .eq("id", contentId);

  if (error) return { error: error.message };

  const { data: stillApproved } = await supabase
    .from("campaign_content")
    .select("id")
    .eq("campaign_id", row.campaign_id)
    .eq("status", "approved")
    .limit(1);

  if (!stillApproved?.length) {
    await supabase
      .from("campaigns")
      .update({ status: "draft" })
      .eq("id", row.campaign_id);
  }

  revalidatePath(`/dashboard/copilot/${row.campaign_id}`);
  return { success: "Variant saved as edited." };
}

export async function setContentStatusAction(
  contentId: string,
  status: Extract<ContentStatus, "approved" | "rejected">,
): Promise<CopilotActionState> {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: row, error: fetchError } = await supabase
    .from("campaign_content")
    .select(
      "id, campaign_id, status, campaigns!inner(creator_id, project_id, status)",
    )
    .eq("id", contentId)
    .maybeSingle();

  if (fetchError) return { error: fetchError.message };
  if (!row) return { error: "Content not found." };

  const campaign = row.campaigns as unknown as {
    creator_id: string;
    project_id: string;
    status: string;
  };
  if (campaign.creator_id !== user.id) return { error: "Not allowed." };

  const { error } = await supabase
    .from("campaign_content")
    .update({
      status,
      approved_by: status === "approved" ? user.id : null,
      approved_at: status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", contentId);

  if (error) return { error: error.message };

  if (status === "approved") {
    await supabase
      .from("campaigns")
      .update({ status: "approved" })
      .eq("id", row.campaign_id);
  } else {
    const { data: stillApproved } = await supabase
      .from("campaign_content")
      .select("id")
      .eq("campaign_id", row.campaign_id)
      .eq("status", "approved")
      .limit(1);

    if (!stillApproved?.length) {
      await supabase
        .from("campaigns")
        .update({ status: "draft" })
        .eq("id", row.campaign_id);
    }
  }

  const { data: project } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", campaign.project_id)
    .maybeSingle();

  revalidatePath(`/dashboard/copilot/${row.campaign_id}`);
  revalidatePath("/dashboard/copilot");
  if (project?.slug) {
    revalidatePath(`/projects/${project.slug}`);
  }

  return {
    success:
      status === "approved"
        ? "Variant approved — it can appear on the public project page."
        : "Variant rejected.",
  };
}

export type CampaignWithContent = Campaign & {
  campaign_content: CampaignContent[];
  project?: { id: string; name: string; slug: string; status: string } | null;
};
