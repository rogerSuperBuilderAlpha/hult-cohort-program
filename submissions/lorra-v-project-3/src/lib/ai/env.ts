import "server-only";

export function getAnthropicApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("Missing environment variable: ANTHROPIC_API_KEY");
  }
  return key;
}
