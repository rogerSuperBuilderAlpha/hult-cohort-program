import Anthropic from '@anthropic-ai/sdk';

/**
 * Rally's server-side model access — one thin, degradable wrapper for all three intelligences.
 *
 * The invariant every intelligence rests on (tech-spec §1, §7): the model NEVER has authority.
 * It classifies, summarises, and drafts; it never writes a points-bearing row, and every call
 * degrades to a no-op (null) when ANTHROPIC_API_KEY is absent or the call fails. The callers
 * always have a deterministic fallback, so Rally works fully with the model switched off — that
 * is what makes the AI "invisible": remove it and nothing breaks, it just gets less clever.
 *
 * Models per tech-spec §2/§7: Brief uses claude-opus-4-8, everything else claude-sonnet-5.
 */
export const MODELS = {
  brief: 'claude-opus-4-8',
  default: 'claude-sonnet-5',
} as const;

export function hasModel(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/** Call Claude for a single-turn completion. Returns the text, or null on absence/any failure. */
export async function callClaude(opts: {
  model: string;
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const client = new Anthropic({ apiKey: key });
    const res = await client.messages.create({
      model: opts.model,
      max_tokens: opts.maxTokens ?? 1024,
      system: opts.system,
      messages: [{ role: 'user', content: opts.prompt }],
    });
    const block = res.content.find((b) => b.type === 'text');
    return block && block.type === 'text' ? block.text : null;
  } catch {
    // Rate limit, timeout, bad key, malformed response — all the same to the caller: degrade.
    return null;
  }
}

/**
 * Parse a JSON object out of a model response, tolerating prose and ```json fences, and
 * validate it before trusting it. Pure — the untrusted-output backstop the routes rely on,
 * testable without a live model. Returns null on anything unparseable or invalid.
 */
export function extractJson<T>(text: string | null, validate: (v: unknown) => v is T): T | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const startArr = candidate.indexOf('[');
  const from = start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);
  if (from === -1) return null;
  const end = Math.max(candidate.lastIndexOf('}'), candidate.lastIndexOf(']'));
  if (end === -1 || end < from) return null;
  try {
    const parsed = JSON.parse(candidate.slice(from, end + 1));
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
