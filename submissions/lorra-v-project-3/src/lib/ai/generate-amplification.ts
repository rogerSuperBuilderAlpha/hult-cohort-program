import "server-only";

import { CAMPAIGN_MODEL, getAnthropicClient } from "@/lib/ai/client";
import {
  AmplificationOutputSchema,
  type AmplificationOutput,
} from "@/lib/types/amplification";

const SYSTEM_PROMPT = `You write short peer endorsements for builders in the same cohort. Sound like a genuine fellow participant who respects the work — not a press release, not marketing copy, and not the original campaign text rewritten. Ground every claim in the supplied campaign evidence and the amplifier's own profile. Do not invent shared history, collaboration, users, revenue, partnerships, or results. Shared cohort membership is the only relationship you may reference. Avoid excessive emojis and hype. Respond ONLY with a JSON object matching the requested schema — no preamble, no markdown fences.`;

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function parseAmplificationJson(raw: string): AmplificationOutput {
  const text = stripCodeFences(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Model returned non-JSON content.");
  }
  return AmplificationOutputSchema.parse(parsed);
}

export async function generateAmplificationCopy(
  userPrompt: string,
): Promise<AmplificationOutput> {
  const client = getAnthropicClient();

  async function call(prompt: string) {
    const response = await client.messages.create({
      model: CAMPAIGN_MODEL,
      max_tokens: 1024,
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
    return parseAmplificationJson(await call(userPrompt));
  } catch (firstError) {
    const detail =
      firstError instanceof Error ? firstError.message : String(firstError);
    const retryPrompt = `${userPrompt}

Your previous response failed validation with this error:
${detail}

Return ONLY a corrected JSON object that matches the schema. No markdown fences.`;
    try {
      return parseAmplificationJson(await call(retryPrompt));
    } catch (secondError) {
      const msg =
        secondError instanceof Error
          ? secondError.message
          : "Could not parse endorsement.";
      throw new Error(
        `We couldn’t draft a usable endorsement (${msg}). Try again in a moment.`,
      );
    }
  }
}

export function buildAmplificationUserPrompt(input: {
  cohortName: string;
  cohortMission: string | null;
  cohortTagline: string | null;
  amplifier: {
    name: string | null;
    biography: string | null;
    skills: string[];
    interests: string[];
  };
  builderName: string | null;
  projectName: string;
  campaign: {
    story_angle: string | null;
    why_angle_matters: string | null;
    core_message: string | null;
    evidence: string[];
    call_to_action: string | null;
  };
}): string {
  return `Draft a personalized peer endorsement that ${input.amplifier.name || "a cohort builder"} can share about a fellow builder's campaign.

Cohort:
- name: ${input.cohortName}
- mission: ${input.cohortMission ?? "(not set)"}
- tagline: ${input.cohortTagline ?? "(not set)"}

Amplifier (the person writing the boost):
${JSON.stringify(input.amplifier, null, 2)}

Target builder: ${input.builderName ?? "a fellow builder"}
Target project: ${input.projectName}

Target campaign:
${JSON.stringify(input.campaign, null, 2)}

Return a JSON object with exactly this shape:
{
  "endorsement": string
}

Rules:
- First person, as the amplifier
- 2–5 short paragraphs or a tight social-length note (roughly 80–220 words)
- Reference concrete evidence from the campaign; do not paste or paraphrase the campaign posts wholesale
- May mention building alongside them in the Hult Summer Cohort — nothing beyond that shared context
- No invented traction or relationship history`;
}
