import {
  rubricDimensions,
  type DimensionScore,
  type PromptScoreResult,
  type ScoreLetter,
} from "@/content/baseline-assessment";

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function countHits(text: string, patterns: RegExp[]): number {
  return patterns.reduce((n, p) => n + (p.test(text) ? 1 : 0), 0);
}

/** Situation: live moment — who, what slipped, and time pressure. */
function scoreS(text: string): 0 | 1 | 2 {
  const who = hasAny(text, [
    /\bcontractor\b/i,
    /\bvp\b/i,
    /\bproject management\b/i,
    /\bvice\s*president\b/i,
  ]);
  const what = hasAny(text, [
    /\bmilestone\b/i,
    /\bdelay(?:ed|s)?\b/i,
    /\bslipp?(?:ed|ing)?\b/i,
    /\bmiss(?:ed|ing)?\b/i,
    /\boverdue\b/i,
  ]);
  const when = hasAny(text, [
    /\bfour\b/i,
    /\b4\s*(business\s*)?days?\b/i,
    /\b11:?00\s*(am)?\b/i,
    /\bby\s+11\b/i,
    /\bdeadline\b/i,
  ]);

  if (who && what && when) return 2;
  if (who || what || when || /\b(delay|slip|milestone|issue|problem)\b/i.test(text))
    return 1;
  return 0;
}

/** Context: facts, unknowns, don’t-invent — not tone (tone lives in Expectations). */
function scoreC(text: string): 0 | 1 | 2 {
  const factHits = countHits(text, [
    /\bovertime\b/i,
    /\bOT\b/,
    /\bprocurement\b/i,
    /\bapproval\b/i,
    /\bcontractor\b/i,
    /\bfour\b/i,
    /\b4\s*(business\s*)?days?\b/i,
    /\bmilestone\b/i,
    /\bextension\b/i,
    /\bunconfirm/i,
    /\broot\s*cause\b/i,
    /\bemployee/i,
    /\bconversation/i,
  ]);
  const unknowns = hasAny(text, [
    /\bdon'?t\s+invent\b/i,
    /\bdo\s+not\s+invent\b/i,
    /\bwithout\s+invent/i,
    /\bunverified\b/i,
    /\bunknown\b/i,
    /\bopen\s+question/i,
    /\bno\s+email\b/i,
    /\brumor\b/i,
    /\bnot\s+(treat|assume|confirm)/i,
    /\bseparate\s+(confirmed|fact)/i,
    /\bno\s+email\s+confirmation\b/i,
  ]);

  if (factHits >= 2 && unknowns) return 2;
  if (factHits >= 1 || unknowns) return 1;
  return 0;
}

/**
 * Objective: checkable task/outcome.
 * Format words (bullets, forwardable) and the 11:00 deadline alone are not enough.
 */
function scoreO(text: string): 0 | 1 | 2 {
  const mushyOnly =
    /\b(write something useful|help with|thoughts on|look at|review this)\b/i.test(
      text,
    ) &&
    !/\b(draft|prepare|produce|create|write)\b.+\b(status|update|brief|email|memo)\b/i.test(
      text,
    );

  const deliverableType = hasAny(text, [
    /\bemail\b/i,
    /\bupdate\b/i,
    /\bbrief\b/i,
    /\bmemo\b/i,
    /\breport\b/i,
    /\bnote\b/i,
  ]);

  const taskVerb = hasAny(text, [
    /\bdraft\b/i,
    /\bprepare\b/i,
    /\bproduce\b/i,
    /\bcreate\b/i,
    /\bwrite\b/i,
    /\bgenerate\b/i,
  ]);

  const checkableOutcome = hasAny(text, [
    /\bopen questions?\b/i,
    /\bshort (status )?update\b/i,
    /\bstatus update\b/i,
    /\bexecutive summary\b/i,
    /\bno new (date|promise|deadline|agreement)/i,
    /\bseparat(?:e|ing)\s+(confirmed|facts?)/i,
    /\bwithout (making )?promis/i,
    /\brecommend\b.+\b(action|item)/i,
    /\b\d+\s+action items?\b/i,
    /\bget (the )?project back on track\b/i,
    /\binform(?:ing)?\b.+\b(issue|status|current)\b/i,
    /\bdo(?:\s+not|n'?t)\s+invent\b/i,
  ]);

  const audienceVp = hasAny(text, [
    /\bfor (the )?VP\b/i,
    /\bto (the )?VP\b/i,
    /\bVP\b.+\b(update|status|brief|email)\b/i,
    /\b(update|status|brief|email)\b.+\bVP\b/i,
  ]);

  if (mushyOnly && !checkableOutcome) return 0;
  // Full credit: clear task + deliverable shape + checkable success criteria.
  if (taskVerb && deliverableType && checkableOutcome) return 2;
  if (checkableOutcome && taskVerb && audienceVp) return 2;
  if (deliverableType || (taskVerb && text.trim().split(/\s+/).length >= 12))
    return 1;
  if (/\bwrite\b/i.test(text) && text.trim().split(/\s+/).length < 12) return 0;
  return 0;
}

/** True only when the prompt assigns Copilot a role (not the learner’s job title). */
function hasRoleAssignment(text: string): boolean {
  return hasAny(text, [
    /\bact as\b/i,
    /\brespond as\b/i,
    /\btake (on )?the role\b/i,
    /\byour role\s*(is|:)\b/i,
    /\brole\s*:/i,
    /\byou are (an?|the)\b/i,
    /\bwrite as (an?|the)\b/i,
  ]);
}

function scoreR(text: string): 0 | 1 | 2 {
  if (!hasRoleAssignment(text)) return 0;

  const specificRole = hasAny(text, [
    /\boperations lead\b/i,
    /\baccount manager\b/i,
    /\bproject manager\b/i,
    /\bprogram manager\b/i,
    /\boperations manager\b/i,
    /\bops manager\b/i,
    /\bclient[- ]facing\b/i,
  ]);
  const vagueRole = hasAny(text, [
    /\bexpert\b/i,
    /\bassistant\b/i,
    /\bAI\b/,
    /\bprofessional writer\b/i,
    /\bhelpful\b/i,
  ]);

  if (specificRole) return 2;
  if (vagueRole || hasRoleAssignment(text)) return 1;
  return 0;
}

/**
 * Expectations: how the response is presented — format, reader fit, and tone.
 * Naming the VP / “Project Management” alone does not count.
 */
function scoreE(text: string): 0 | 1 | 2 {
  const format = hasAny(text, [
    /\bformat\s*:/i,
    /\bpresent (it |this |the (update|email|note) )?as\b/i,
    /\bin the form of\b/i,
    /\bstructure\s*(as|:|with)\b/i,
    /\bone[- ]page\b/i,
    /\bbullet(?:ed|s)?\b/i,
    /\bheadings?\b/i,
    /\bexecutive summary\b/i,
    /\bunder \d+\b/i,
    /\b\d+\s*(words?|sentences?|paragraphs?|bullets?)\b/i,
    /\bno more than \d+\b/i,
    /\buse (a )?bullets?\b/i,
    /\bsections?\s*:/i,
  ]);

  const readerFit = hasAny(text, [
    /\bforwardable\b/i,
    /\bsuitable (for|to) (a |the )?(VP|vice|senior)\b/i,
    // Use-cues: what the reader will do with the output (not audience alone).
    /\bfor (a |the )?VP to (skim|forward|read|review|glance(?:\s+at)?|scan|decide)\b/i,
    /\bskim(?:mable)?\b/i,
    /\bread(?:y|able) for (a |the )?(VP|vice|senior)\b/i,
    /\bVP can (skim|forward|read|review|glance|scan|decide)\b/i,
    /\b(share|circulate|pass along|send on)\b.+\b(VP|vice|senior|leadership)\b/i,
    /\b(VP|vice|senior|leadership)\b.+\b(share|circulate|forward|review)\b/i,
    /\bbefore (his|her|their|the) (next )?meeting\b/i,
  ]);

  const tone = hasAny(text, [
    /\bcalm\b/i,
    /\bno\s+blame\b/i,
    /\bwithout\s+blame\b/i,
    /\bblame\s+theater\b/i,
    /\baccountable\b/i,
    /\bprofessional\s+tone\b/i,
    /\btone\s*:/i,
    /\bformal tone\b/i,
    /\bno\s+promis/i,
    /\bpolite\b/i,
    // Natural “polite and professional” without requiring the word “tone”.
    /\bprofessional\b/i,
  ]);

  // Level 2: explicit format plus how it should read (reader fit and/or tone).
  if (format && (readerFit || tone)) return 2;
  if (format) return 1;
  // Tone or reader-fit alone without format is a partial Expectation.
  if (readerFit || tone) return 1;
  return 0;
}

const scorers: Record<ScoreLetter, (text: string) => 0 | 1 | 2> = {
  S: scoreS,
  C: scoreC,
  O: scoreO,
  R: scoreR,
  E: scoreE,
};

export function scorePrompt(prompt: string): PromptScoreResult {
  const text = prompt.trim();
  const dimensions: DimensionScore[] = rubricDimensions.map((dim) => {
    const score = text.length < 8 ? 0 : scorers[dim.letter](text);
    return {
      letter: dim.letter,
      score,
      feedback: dim.levels[score],
    };
  });
  const total = dimensions.reduce((sum, d) => sum + d.score, 0);
  return { total, max: 10, dimensions };
}
