import { z } from "zod";
import { NEEDS, PROJECT_STAGES, SECTORS } from "@/lib/constants";

/** Empty string → null; otherwise must be a valid URL. */
const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || URL.canParse(v), {
    message: "Enter a valid URL.",
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v));

/** Short tags (skills / interests). */
const tagList = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Tag cannot be empty.")
      .max(40, "Each tag must be 40 characters or fewer."),
  )
  .max(20)
  .default([]);

/** Technology names — allow longer labels than skill tags. */
const technologyList = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Technology name cannot be empty.")
      .max(80, "Each technology must be 80 characters or fewer."),
  )
  .max(20)
  .default([]);

const nullableImageUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return null;
    const trimmed = v.trim();
    return trimmed === "" ? null : trimmed;
  })
  .refine((v) => v === null || URL.canParse(v), {
    message: "Image URL is invalid.",
  });

export const profileFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  biography: optionalText(2000).optional().nullable(),
  location: optionalText(120).optional().nullable(),
  skills: tagList,
  interests: tagList,
  website_url: optionalUrl.optional().nullable(),
  github_profile_url: optionalUrl.optional().nullable(),
  linkedin: optionalUrl.optional().nullable(),
  x: optionalUrl.optional().nullable(),
  instagram: optionalUrl.optional().nullable(),
  youtube: optionalUrl.optional().nullable(),
  visible_to_partners: z.boolean().default(true),
  avatar_url: nullableImageUrl.optional().nullable(),
});

export const profilePublishSchema = profileFormSchema.extend({
  biography: z
    .string()
    .trim()
    .min(40, "Add a short bio (at least 40 characters) before publishing.")
    .max(2000),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

const stageValues = PROJECT_STAGES.map((s) => s.value) as [
  (typeof PROJECT_STAGES)[number]["value"],
  ...(typeof PROJECT_STAGES)[number]["value"][],
];

const sectorTuple = SECTORS as unknown as [string, ...string[]];
const needTuple = NEEDS as unknown as [string, ...string[]];

/**
 * Project field max lengths (publish + save):
 * - tagline: 200
 * - summary: 500
 * - description: 5000
 * - problem: 3000
 * - solution: 3000
 * - target_audience: 1000
 * - technology_stack item: 80 (was incorrectly sharing skills' 40-char cap)
 */
export const projectFormSchema = z.object({
  name: z.string().trim().min(2, "Project name is required.").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(80)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens.",
    ),
  tagline: optionalText(200).optional().nullable(),
  summary: optionalText(500).optional().nullable(),
  description: optionalText(5000).optional().nullable(),
  problem: optionalText(3000).optional().nullable(),
  solution: optionalText(3000).optional().nullable(),
  target_audience: optionalText(1000).optional().nullable(),
  technology_stack: technologyList,
  stage: z.enum(stageValues),
  live_url: optionalUrl.optional().nullable(),
  github_url: optionalUrl.optional().nullable(),
  demo_url: optionalUrl.optional().nullable(),
  image_url: nullableImageUrl.optional().nullable(),
  needs: z.array(z.enum(needTuple)).default([]),
  sectors: z
    .array(z.enum(sectorTuple))
    .min(1, "Pick at least one sector."),
});

export const projectPublishSchema = projectFormSchema.extend({
  tagline: z
    .string()
    .trim()
    .min(10, "Add a tagline before publishing.")
    .max(200, "Tagline must be 200 characters or fewer."),
  summary: z
    .string()
    .trim()
    .min(40, "Add a summary (at least 40 characters) before publishing.")
    .max(500, "Summary must be 500 characters or fewer."),
  problem: z
    .string()
    .trim()
    .min(20, "Describe the problem before publishing.")
    .max(3000, "Problem must be 3000 characters or fewer."),
  solution: z
    .string()
    .trim()
    .min(20, "Describe the solution before publishing.")
    .max(3000, "Solution must be 3000 characters or fewer."),
});

export type ProjectFormInput = z.infer<typeof projectFormSchema>;

const FIELD_LABELS: Record<string, string> = {
  name: "Project name",
  slug: "Slug",
  tagline: "Tagline",
  summary: "Summary",
  description: "Description",
  problem: "Problem",
  solution: "Solution",
  target_audience: "Target audience",
  technology_stack: "Technology stack",
  stage: "Stage",
  live_url: "Live URL",
  github_url: "GitHub URL",
  demo_url: "Demo URL",
  image_url: "Cover image",
  needs: "Needs",
  sectors: "Sectors",
};

/** Prefer "Summary: …" over bare Zod messages so the UI names the failing field. */
export function formatZodError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid input.";

  const root = String(issue.path[0] ?? "");
  const label = FIELD_LABELS[root] ?? (root || "Form");
  const index =
    typeof issue.path[1] === "number" ? ` (item ${issue.path[1] + 1})` : "";

  return `${label}${index}: ${issue.message}`;
}
