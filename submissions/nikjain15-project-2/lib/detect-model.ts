import { MODELS, callClaude, extractJson, hasModel } from './agent';
import { detectRecognitions, type DetectedRecognition } from './detect';

/**
 * The model layer over recognition detection. When ANTHROPIC_API_KEY is present it asks Claude
 * to read gratitude out of a message; on absence OR any failure/invalid output it falls back to
 * the deterministic `detectRecognitions`. So detection is always at least as good as the
 * baseline, never worse, and the model is invisible — remove it and detection still works.
 *
 * The model output is UNTRUSTED (it read attacker-controllable message text): it's schema-
 * validated here and still only ever produces a *suggested* recognition that the helped peer
 * must confirm — inference never carries points.
 */

const KINDS = new Set(['answered', 'unblocked', 'reviewed', 'paired']);

function isDetections(v: unknown): v is { helperHandle: string; kind: string }[] {
  return (
    Array.isArray(v) &&
    v.every(
      (x) =>
        x && typeof x === 'object' &&
        typeof (x as Record<string, unknown>).helperHandle === 'string' &&
        typeof (x as Record<string, unknown>).kind === 'string',
    )
  );
}

export async function detectRecognitionsSmart(body: string): Promise<DetectedRecognition[]> {
  if (!hasModel()) return detectRecognitions(body);

  const text = await callClaude({
    model: MODELS.default,
    system:
      'You extract peer recognition from a chat message written by the HELPED person crediting ' +
      'someone. Return ONLY a JSON array of {"helperHandle": string (the @handle they credit, ' +
      'without the @), "kind": one of "answered"|"unblocked"|"reviewed"|"paired"}. Empty array ' +
      'if the message does not credit anyone. Never infer that the AUTHOR helped someone.',
    prompt: body,
    maxTokens: 300,
  });

  const parsed = extractJson(text, isDetections);
  if (!parsed) return detectRecognitions(body); // fall back on absence / invalid output

  // Normalise + drop anything with an unknown kind rather than trusting free text.
  const cleaned = parsed
    .map((d) => ({ helperHandle: d.helperHandle.replace(/^@/, '').toLowerCase(), kind: d.kind.toLowerCase() }))
    .filter((d) => d.helperHandle && KINDS.has(d.kind)) as DetectedRecognition[];
  return cleaned;
}
