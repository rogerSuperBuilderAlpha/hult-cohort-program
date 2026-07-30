import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  slug: z
    .string()
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes")
    .optional()
    .or(z.literal("")),
  description: z.string().min(1, "Description is required").max(5000),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  techStack: z.string().min(1, "At least one tech is required").max(500),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  liveUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  featured: z.boolean().default(false),
  memberIds: z.array(z.string()).optional().default([]),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
