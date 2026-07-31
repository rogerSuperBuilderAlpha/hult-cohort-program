import "server-only";

import { CAMPAIGN_MODEL, getAnthropicClient } from "@/lib/ai/client";
import {
  CampaignOutputSchema,
  type CampaignOutput,
} from "@/lib/types/campaign";

const SYSTEM_PROMPT = `You are a campaign strategist for a community of builders. Identify the clearest, most credible, and most engaging story within the supplied project information. Use evidence rather than hype. Preserve the participant's voice while connecting the work to the wider momentum of the cohort. Never invent users, revenue, partnerships, results, or capabilities not present in the supplied material. Distinguish completed work from planned work. Avoid generic filler phrases, excessive emojis, and exaggerated claims. Each channel's content must be written for that channel, not copied across. Respond ONLY with a JSON object matching the requested schema — no preamble, no markdown fences.`;

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function parseCampaignJson(raw: string): CampaignOutput {
  const text = stripCodeFences(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Model returned non-JSON content.");
  }
  return CampaignOutputSchema.parse(parsed);
}

export async function generateCampaignCopy(
  userPrompt: string,
): Promise<CampaignOutput> {
  const client = getAnthropicClient();

  async function call(prompt: string) {
    const response = await client.messages.create({
      model: CAMPAIGN_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!text) {
      throw new Error("Model returned an empty response.");
    }
    return text;
  }

  try {
    return parseCampaignJson(await call(userPrompt));
  } catch (firstError) {
    const detail =
      firstError instanceof Error ? firstError.message : String(firstError);
    const retryPrompt = `${userPrompt}

Your previous response failed validation with this error:
${detail}

Return ONLY a corrected JSON object that matches the schema. No markdown fences.`;
    try {
      return parseCampaignJson(await call(retryPrompt));
    } catch (secondError) {
      const msg =
        secondError instanceof Error
          ? secondError.message
          : "Could not parse campaign output.";
      throw new Error(
        `We couldn’t shape a usable campaign from the model output (${msg}). Try again with a richer project update.`,
      );
    }
  }
}

export function buildCampaignUserPrompt(input: {
  cohortName: string;
  cohortMission: string | null;
  cohortTagline: string | null;
  project: Record<string, unknown>;
  update: Record<string, unknown> | null;
}): string {
  return `Create a multi-channel campaign for this Hult cohort builder project.

Cohort:
- name: ${input.cohortName}
- mission: ${input.cohortMission ?? "(not set)"}
- tagline: ${input.cohortTagline ?? "(not set)"}

Project (JSON):
${JSON.stringify(input.project, null, 2)}

Project update to ground the story (JSON, may be null):
${JSON.stringify(input.update, null, 2)}

Return a JSON object with exactly these keys:
{
  "story_angle": string,
  "why_this_angle_matters": string,
  "audience": string[],
  "core_message": string,
  "evidence": string[],
  "call_to_action": string,
  "linkedin_post": string,
  "x_post": string,
  "instagram_caption": string,
  "partner_summary": string,
  "campaign_tags": string[]
}

Rules reminder: evidence only from the supplied material; no invented traction; channel-native copy; x_post max 1100 characters.`;
}
