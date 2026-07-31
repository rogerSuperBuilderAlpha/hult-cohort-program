import { z } from "zod";

export const AmplificationOutputSchema = z.object({
  endorsement: z.string().min(40).max(1600),
});

export type AmplificationOutput = z.infer<typeof AmplificationOutputSchema>;

export type AmplificationStatus = "draft" | "shared";

export type Amplification = {
  id: string;
  campaign_id: string;
  participant_id: string;
  content: string;
  status: AmplificationStatus;
  shared_at: string | null;
  created_at: string;
};
