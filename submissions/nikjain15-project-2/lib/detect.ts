/**
 * Recognition detection — the deterministic baseline.
 *
 * One of Rally's three intelligences. The spec's design is Claude-in-the-loop, but every
 * intelligence must degrade to a no-op when the model is unavailable — so the baseline is
 * this pure, dependency-free matcher, and the model path (added next) layers on top and falls
 * back here. Detection NEVER awards anything: it only proposes a *suggested* recognition that
 * the helped peer must confirm. That's the anti-gaming spine — inference can be wrong, so it
 * never carries points on its own.
 *
 * Grammar of gratitude, from the helped person's own mouth: "thanks @alice", "@bob unblocked
 * me", "@carol answered my question". The AUTHOR is the helped party; the mentioned handle is
 * the helper. We only ever infer from the author crediting someone else — never from a claim
 * that you helped someone (that would be self-serving and forgeable).
 */

export type DetectedRecognition = {
  helperHandle: string;
  kind: 'answered' | 'unblocked' | 'reviewed' | 'paired';
};

const VERB_KIND: { re: RegExp; kind: DetectedRecognition['kind'] }[] = [
  { re: /\bunblock(?:ed|ing)?\b/i, kind: 'unblocked' },
  { re: /\banswer(?:ed|ing)?\b/i, kind: 'answered' },
  { re: /\breview(?:ed|ing)?\b/i, kind: 'reviewed' },
  { re: /\bpair(?:ed|ing)?\b/i, kind: 'paired' },
  { re: /\b(?:thanks|thank you|thx|ty|kudos|shoutout|shout-out|props)\b/i, kind: 'answered' },
];

const MENTION = /@([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})/gi;

/**
 * Return the recognitions a message implies. Deduped by helper handle so "thanks @alice,
 * @alice you're a lifesaver" yields one suggestion. Empty when nothing credits anyone.
 */
export function detectRecognitions(body: string): DetectedRecognition[] {
  const text = body.trim();
  if (!text) return [];

  // Must read as gratitude/credit, or we infer nothing.
  const verb = VERB_KIND.find((v) => v.re.test(text));
  if (!verb) return [];

  const mentions = new Set<string>();
  for (const m of text.matchAll(MENTION)) mentions.add(m[1].toLowerCase());
  if (mentions.size === 0) return [];

  return [...mentions].map((h) => ({ helperHandle: h, kind: verb.kind }));
}
