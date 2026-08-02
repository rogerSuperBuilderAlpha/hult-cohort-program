import { z } from "zod";
import { NEEDS } from "@/lib/constants";

export const INTEREST_TYPES = [...NEEDS, "General"] as const;
export type InterestType = (typeof INTEREST_TYPES)[number];

export type EnquiryStatus = "new" | "in_progress" | "closed";

export type PartnerEnquiry = {
  id: string;
  cohort_id: string;
  project_id: string | null;
  participant_id: string | null;
  organization: string;
  contact_name: string;
  email: string;
  interest_type: string;
  website_url: string | null;
  linkedin_url: string | null;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
};

const optionalUuid = z
  .string()
  .trim()
  .transform((v) => (v === "" || v === "none" ? null : v))
  .refine((v) => v === null || z.string().uuid().safeParse(v).success, {
    message: "Invalid selection.",
  });

/** Empty string → null; otherwise must be a valid URL. */
const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || URL.canParse(v), {
    message: "Enter a valid URL.",
  });

export const PartnerEnquiryInputSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(2, "Enter your organization.")
    .max(120),
  contact_name: z
    .string()
    .trim()
    .min(2, "Enter a contact name.")
    .max(80),
  email: z.string().trim().email("Enter a valid email.").max(160),
  interest_type: z.enum(INTEREST_TYPES),
  project_id: optionalUuid,
  participant_id: optionalUuid,
  website_url: optionalUrl,
  linkedin_url: optionalUrl,
  message: z
    .string()
    .trim()
    .max(4000)
    .transform((v) => (v === "" ? null : v)),
});

export type PartnerEnquiryInput = z.infer<typeof PartnerEnquiryInputSchema>;

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  closed: "Closed",
};
