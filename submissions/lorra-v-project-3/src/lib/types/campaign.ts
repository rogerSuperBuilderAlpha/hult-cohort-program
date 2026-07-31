import { z } from "zod";

export const CampaignOutputSchema = z.object({
  story_angle: z.string().min(1),
  why_this_angle_matters: z.string().min(1),
  audience: z.array(z.string()).min(1),
  core_message: z.string().min(1),
  evidence: z.array(z.string()).min(1),
  call_to_action: z.string().min(1),
  linkedin_post: z.string().min(1),
  x_post: z.string().min(1).max(1100),
  instagram_caption: z.string().min(1),
  partner_summary: z.string().min(1),
  campaign_tags: z.array(z.string()).default([]),
});

export type CampaignOutput = z.infer<typeof CampaignOutputSchema>;

export type ContentChannel =
  | "linkedin"
  | "x"
  | "instagram"
  | "partner_summary";

export type ContentStatus =
  | "generated"
  | "edited"
  | "approved"
  | "rejected";

export type CampaignStatus = "draft" | "approved" | "archived";

export type Campaign = {
  id: string;
  cohort_id: string;
  project_id: string;
  project_update_id: string | null;
  creator_id: string;
  name: string;
  story_angle: string | null;
  why_angle_matters: string | null;
  audience: string[];
  core_message: string | null;
  evidence: string[];
  call_to_action: string | null;
  status: CampaignStatus;
  tracking_code: string;
  created_at: string;
};

export type CampaignContent = {
  id: string;
  campaign_id: string;
  channel: ContentChannel;
  content: string;
  status: ContentStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
};

export const CHANNEL_LABELS: Record<ContentChannel, string> = {
  linkedin: "LinkedIn post",
  x: "X post",
  instagram: "Instagram caption",
  partner_summary: "Partner summary",
};
