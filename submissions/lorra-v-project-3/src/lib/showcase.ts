import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/profile";
import type { Project } from "@/lib/types/project";

export type PublicBuilder = Pick<
  Profile,
  | "id"
  | "name"
  | "avatar_url"
  | "biography"
  | "location"
  | "skills"
  | "interests"
  | "social_links"
  | "website_url"
  | "github_profile_url"
  | "profile_status"
  | "visible_to_partners"
>;

export type PublicProjectOwner = Pick<
  Profile,
  "id" | "name" | "avatar_url" | "location"
> & {
  /** False when profile is unpublished/incomplete — show name, do not link. */
  linkable: boolean;
};

export type PublicProject = Project & {
  owner?: PublicProjectOwner | null;
};

export type ApprovedCampaignContent = {
  id: string;
  channel: string;
  content: string;
  campaign: {
    id: string;
    name: string;
    story_angle: string | null;
    why_angle_matters: string | null;
    core_message: string | null;
    call_to_action: string | null;
    project_id: string;
  };
};

export async function listPublishedBuilders(limit = 48): Promise<PublicBuilder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, name, avatar_url, biography, location, skills, interests, social_links, website_url, github_profile_url, profile_status, visible_to_partners",
    )
    .eq("profile_status", "published")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as PublicBuilder[];
}

export async function getPublishedBuilder(
  id: string,
): Promise<PublicBuilder | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, name, avatar_url, biography, location, skills, interests, social_links, website_url, github_profile_url, profile_status, visible_to_partners",
    )
    .eq("id", id)
    .eq("profile_status", "published")
    .maybeSingle();

  if (error) throw error;
  return (data as PublicBuilder | null) ?? null;
}

async function resolveProjectOwner(
  ownerId: string,
  nestedOwner: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    location: string | null;
  } | null,
): Promise<PublicProjectOwner | null> {
  if (nestedOwner) {
    return { ...nestedOwner, linkable: true };
  }

  // Unpublished/incomplete owners are hidden by profiles RLS on the join.
  // Fetch name for attribution only (no public profile link).
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, name, avatar_url, location, profile_status")
    .eq("id", ownerId)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id as string,
    name: (data.name as string | null) ?? null,
    avatar_url: (data.avatar_url as string | null) ?? null,
    location: (data.location as string | null) ?? null,
    linkable: data.profile_status === "published",
  };
}

function normalizeNestedOwner(
  raw: unknown,
): {
  id: string;
  name: string | null;
  avatar_url: string | null;
  location: string | null;
} | null {
  const owner = (Array.isArray(raw) ? raw[0] : raw) as {
    id: string;
    name: string | null;
    avatar_url: string | null;
    location: string | null;
  } | null;
  return owner ?? null;
}

export async function listPublishedProjects(options?: {
  limit?: number;
  featuredOnly?: boolean;
}): Promise<PublicProject[]> {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select(
      "*, owner:profiles!projects_owner_id_fkey(id, name, avatar_url, location)",
    )
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(options?.limit ?? 48);

  if (options?.featuredOnly) {
    query = query.eq("featured", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  return Promise.all(
    rows.map(async (row) => {
      const owner = await resolveProjectOwner(
        row.owner_id as string,
        normalizeNestedOwner(row.owner),
      );
      return { ...row, owner } as PublicProject;
    }),
  );
}

export async function getPublishedProjectBySlug(
  slug: string,
): Promise<PublicProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "*, owner:profiles!projects_owner_id_fkey(id, name, avatar_url, location)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const owner = await resolveProjectOwner(
    data.owner_id as string,
    normalizeNestedOwner(data.owner),
  );
  return { ...data, owner } as PublicProject;
}

export async function listPublishedProjectsForOwner(
  ownerId: string,
): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function listProjectUpdates(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_updates")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function listApprovedCampaignContentForProject(projectId: string) {
  const supabase = await createClient();
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(
      "id, name, story_angle, why_angle_matters, core_message, call_to_action, project_id, campaign_content(id, channel, content, status)",
    )
    .eq("project_id", projectId)
    .eq("status", "approved");

  if (error) throw error;

  const items: ApprovedCampaignContent[] = [];
  for (const campaign of campaigns ?? []) {
    const contents = (campaign.campaign_content ?? []) as Array<{
      id: string;
      channel: string;
      content: string;
      status: string;
    }>;
    for (const row of contents) {
      if (row.status !== "approved") continue;
      items.push({
        id: row.id,
        channel: row.channel,
        content: row.content,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          story_angle: campaign.story_angle,
          why_angle_matters: campaign.why_angle_matters,
          core_message: campaign.core_message,
          call_to_action: campaign.call_to_action,
          project_id: campaign.project_id,
        },
      });
    }
  }
  return items;
}

export async function listApprovedCampaignContentForCreator(creatorId: string) {
  const supabase = await createClient();
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(
      "id, name, story_angle, why_angle_matters, core_message, call_to_action, project_id, status, campaign_content(id, channel, content, status), project:projects!campaigns_project_id_fkey(status)",
    )
    .eq("creator_id", creatorId)
    .eq("status", "approved");

  if (error) throw error;

  const items: ApprovedCampaignContent[] = [];
  for (const campaign of campaigns ?? []) {
    const project = campaign.project as { status?: string } | null;
    if (project?.status !== "published") continue;
    const contents = (campaign.campaign_content ?? []) as Array<{
      id: string;
      channel: string;
      content: string;
      status: string;
    }>;
    for (const row of contents) {
      if (row.status !== "approved") continue;
      items.push({
        id: row.id,
        channel: row.channel,
        content: row.content,
        campaign: {
          id: campaign.id,
          name: campaign.name,
          story_angle: campaign.story_angle,
          why_angle_matters: campaign.why_angle_matters,
          core_message: campaign.core_message,
          call_to_action: campaign.call_to_action,
          project_id: campaign.project_id,
        },
      });
    }
  }
  return items;
}

export type PublicAmplification = {
  id: string;
  content: string;
  shared_at: string | null;
  participant: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
};

/**
 * Shared peer endorsements for a published project's approved campaigns.
 * Relies on `amplifications_select_shared_public` (migration 004).
 */
export async function listSharedAmplificationsForProject(
  projectId: string,
): Promise<PublicAmplification[]> {
  const supabase = await createClient();

  const { data: campaigns, error: campaignError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("project_id", projectId)
    .eq("status", "approved");

  if (campaignError) throw campaignError;

  const campaignIds = (campaigns ?? []).map((c) => c.id);
  if (campaignIds.length === 0) return [];

  const { data, error } = await supabase
    .from("amplifications")
    .select(
      "id, content, shared_at, participant:profiles!amplifications_participant_id_fkey(id, name, avatar_url)",
    )
    .in("campaign_id", campaignIds)
    .eq("status", "shared")
    .order("shared_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const raw = row.participant as unknown;
    const participant = (Array.isArray(raw) ? raw[0] : raw) as
      | PublicAmplification["participant"]
      | null;
    return {
      id: row.id as string,
      content: row.content as string,
      shared_at: (row.shared_at as string | null) ?? null,
      participant: participant ?? null,
    };
  });
}

export async function countAmplificationsForProject(
  projectId: string,
): Promise<number> {
  const rows = await listSharedAmplificationsForProject(projectId);
  return rows.length;
}
