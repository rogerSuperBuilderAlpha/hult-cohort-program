import { z } from "zod";

const stringList = z
  .array(z.string().trim().min(1).max(500))
  .max(20)
  .default([]);

const urlList = z
  .array(
    z
      .string()
      .trim()
      .refine((v) => v === "" || URL.canParse(v), {
        message: "Evidence links must be valid URLs.",
      })
      .transform((v) => v.trim()),
  )
  .max(20)
  .transform((items) => items.filter((v) => v.length > 0))
  .default([]);

export const projectUpdateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(160, "Title is too long."),
  description: z
    .string()
    .trim()
    .max(4000)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional(),
  achievements: stringList,
  challenges: stringList,
  lessons: stringList,
  next_steps: stringList,
  evidence_links: urlList,
});

export type ProjectUpdateFormInput = z.infer<typeof projectUpdateFormSchema>;
