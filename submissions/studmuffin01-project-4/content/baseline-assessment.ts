/**
 * Shared pre/post assessment — Module 01 baseline and Module 10 retest.
 * Scored with SCORE (0–2 each). Tone counted under Expectations (E).
 */

export const baselineScenario = {
  title: "Office Scenario",
  learnerRole:
    "You are an Operations Lead at a mid-size professional services firm.",
  facts: [
    "The main Contractor missed a critical milestone by four (4) business days.",
    "Root cause is unconfirmed (possible procurement delays or internal approval processes).",
    "Overtime is already high this month.",
    "General conversations among employees mention there was “agreement for a two-week extension” — no email confirmation exists.",
    "A short update has been requested to update the VP - Project Management by 11:00am.",
    "No invented dates or agreements. The update should read calmly and accountably — no blame theater.",
  ],
  instruction:
    "Write the prompt you would paste into Copilot to produce that short update for the VP - Project Management. Do not write the email or report itself — write the instructions for Copilot.",
} as const;

export type ScoreLetter = "S" | "C" | "O" | "R" | "E";

export type RubricDimension = {
  letter: ScoreLetter;
  /** Plain label for Module 01 (before SCORE is taught) */
  plainLabel: string;
  /** Full SCORE name for Module 10 retest */
  scoreLabel: string;
  /** 0 / 1 / 2 descriptors shown after scoring */
  levels: [string, string, string];
};

/** Locked 0–2 descriptors — tone lives under Expectations */
export const rubricDimensions: RubricDimension[] = [
  {
    letter: "S",
    plainLabel: "What’s happening",
    scoreLabel: "Situation",
    levels: [
      "No live situation — reads like a topic (“write an email”).",
      "Hints at a problem (delay/slip) but missing who, what, or timing.",
      "Names the live moment: who is affected, what slipped, and the time pressure.",
    ],
  },
  {
    letter: "C",
    plainLabel: "Facts, unknowns & constraints",
    scoreLabel: "Context",
    levels: [
      "No usable facts, unknowns, or don’t-invent constraints.",
      "Some facts or unknowns, but not both confirmed facts and don’t-invent / open questions.",
      "Confirmed facts, open unknowns, and don’t-invent rules (no invented dates or agreements).",
    ],
  },
  {
    letter: "O",
    plainLabel: "Clear deliverable",
    scoreLabel: "Objective",
    levels: [
      "Mushy ask (“write something useful,” “help with this”).",
      "Names a deliverable type (email/update) but not a checkable outcome.",
      "Checkable objective (e.g. draft a short VP status that separates facts from open questions, no new promises).",
    ],
  },
  {
    letter: "R",
    plainLabel: "Who Copilot should act as",
    scoreLabel: "Role",
    levels: [
      "No role assigned to Copilot (saying your own job title doesn’t count).",
      "Role assigned, but vague (“expert,” “assistant”).",
      "Specific useful role assigned (e.g. “Act as an operations lead…”).",
    ],
  },
  {
    letter: "E",
    plainLabel: "Format, tone & fit for the reader",
    scoreLabel: "Expectations",
    levels: [
      "No explicit format or tone (naming the VP alone doesn’t count).",
      "Explicit format (bullets, one-page, word limit) or tone/reader-fit — but not both.",
      "Explicit format plus how it should read (e.g. skim/review/forwardable for the VP, and/or polite/professional tone).",
    ],
  },
];

export type DimensionScore = {
  letter: ScoreLetter;
  score: 0 | 1 | 2;
  feedback: string;
};

export type PromptScoreResult = {
  total: number;
  max: number;
  dimensions: DimensionScore[];
};

export type BaselineRecord = {
  version: 1;
  prompt: string;
  result: PromptScoreResult;
  savedAt: string;
  phase: "baseline" | "retest";
};

export const BASELINE_STORAGE_KEY = "score-course-baseline-v1";
export const RETEST_STORAGE_KEY = "score-course-retest-v1";
