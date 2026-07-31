import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicApiKey } from "@/lib/ai/env";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: getAnthropicApiKey() });
  }
  return client;
}

export const CAMPAIGN_MODEL = "claude-sonnet-4-6";
