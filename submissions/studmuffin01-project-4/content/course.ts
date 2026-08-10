/**
 * Prompt Like a Pro: The SCORE Method — course outline.
 */

export type ModuleKind = "lesson" | "integration" | "capstone" | "takeaway";

export type CourseModule = {
  slug: string;
  order: number;
  kind: ModuleKind;
  letter?: "S" | "C" | "O" | "R" | "E";
  title: string;
  durationMinutes: number;
  summary: string;
  /** Intro / “Why This Matters” points for the module page */
  beats: string[];
  /** Stub exercise shown in the module UI */
  exercise: {
    prompt: string;
    hint?: string;
  };
  successCheck: string;
  /** Optional static sample replies (not live AI) */
  samples?: {
    label: string;
    body: string;
  }[];
};

export const modules: CourseModule[] = [
  {
    slug: "cold-open",
    order: 0,
    kind: "lesson",
    title: "Copilot didn’t fail. Your prompt did.",
    durationMinutes: 5,
    summary: "Learn the real reason Copilot isn't meeting your expectations.",
    beats: [],
    exercise: {
      prompt:
        "Write a Copilot prompt for a short VP update from the office scenario. Score it to set your baseline.",
    },
    successCheck:
      "Learner submits a baseline prompt and receives a diagnostic score saved for the end-of-course retest.",
  },
  {
    slug: "why-ai-fails",
    order: 1,
    kind: "lesson",
    title: "Why isn't AI giving me the results I want?",
    durationMinutes: 6,
    summary: "Learn what's preventing Copilot from delivering better responses.",
    beats: [
      "The issue often isn't the AI, it's how we communicate our needs to it.",
      "AI can only work with the information you provide.",
      "When instructions are unclear, AI fills in the gaps with assumptions.",
      "AI is not a mind reader. It needs context, purpose, and constraints.",
      "Confident wrong answers are still wrong.",
      "The best prompts describe a job to be done, not just a topic to discuss.",
      "Repair starts with finding what’s missing.",
    ],
    exercise: {
      prompt:
        "Complete the ten multiple-choice questions in this module, then submit for feedback.",
    },
    successCheck:
      "Learner submits the lesson quiz and can explain why vague prompts fail at work.",
  },
  {
    slug: "situation",
    order: 2,
    kind: "lesson",
    letter: "S",
    title: "S — Situation: What’s happening?",
    durationMinutes: 6,
    summary:
      "Learn how to give Copilot the real-world situation it needs to understand.",
    beats: [
      "AI can only interpret a request through the context you provide.",
      "Strong situations identify who is affected, what changed, and why the request matters.",
      "Without a live scenario, AI invents one and the output drifts off from the real problem.",
      "The same task can generate very different responses depending on the circumstances.",
      "Good prompts explain the problem before asking for a solution.",
      "Situation reduces guesswork and increases relevance.",
      "If leadership can’t picture the situation from your prompt, Copilot can’t either.",
    ],
    exercise: {
      prompt:
        "Complete the ten multiple-choice questions in this module, then submit for feedback.",
    },
    successCheck:
      "Learner submits the lesson quiz and can spot prompts that include or omit Situation.",
  },
  {
    slug: "context",
    order: 3,
    kind: "lesson",
    letter: "C",
    title: "C — Context: What does Copilot need to know?",
    durationMinutes: 6,
    summary:
      "Learn how to reduce Copilot guesswork by providing the right context.",
    beats: [
      "Context gives AI the information it needs to make informed recommendations.",
      "The more relevant facts you provide, the less AI has to guess.",
      "Context turns a generic response into a tailored response.",
      "Even with a clear problem, missing background can lead to the wrong solution.",
      "Situation names the problem; Context provides what is known, unknown, and off-limits.",
      "Data, facts, constraints, and history help AI understand the real world behind the request.",
      "“Do not invent” is part of Context — especially for numbers, dates, agreements, and root causes.",
    ],
    exercise: {
      prompt:
        "Complete the ten multiple-choice questions in this module, then submit for feedback.",
    },
    successCheck:
      "Learner submits the lesson quiz and can spot prompts that include or omit useful Context.",
  },
  {
    slug: "objective",
    order: 4,
    kind: "lesson",
    letter: "O",
    title: "O — Objective: What exactly do you want Copilot to accomplish?",
    durationMinutes: 6,
    summary:
      "Learn how to define clear outcomes so Copilot knows exactly what to deliver.",
    beats: [
      "Copilot needs a clear objective before it can provide a useful response.",
      "The same information can be used to create a report, email, presentation, or action plan. The objective determines which one.",
      "A strong objective names the output (what), often the reader (for whom), and sometimes the decision it supports.",
      "Clear objectives reduce rework and unnecessary follow-up prompts.",
      "“Review,” “look at,” “help with,” and “write something useful” are not objectives — they don’t define exactly what you want it to accomplish.",
      "Situation and Context set the scene; Objective decides what success looks like.",
      "If you can’t tell whether the answer completed the task, the Objective was missing or vague.",
    ],
    exercise: {
      prompt:
        "Complete the ten multiple-choice questions in this module, then submit for feedback.",
    },
    successCheck:
      "Learner submits the lesson quiz and can spot prompts that include or omit a clear Objective.",
  },
  {
    slug: "role",
    order: 5,
    kind: "lesson",
    letter: "R",
    title: "R — Role: Who should Copilot act as?",
    durationMinutes: 6,
    summary:
      "Learn how to leverage roles for Copilot to generate expert-level outputs.",
    beats: [
      "Role is an instruction to Copilot, not a description of your own job title in the Situation.",
      "Role tells Copilot who to act as — and that choice changes judgment, tone, and what gets emphasized.",
      "Different roles focus on different priorities, risks, and outcomes.",
      "The same facts can produce very different answers from a Maintenance Manager, HR Manager, Safety Specialist or Financial Analyst.",
      "Specifying a role helps Copilot tailor its language, recommendations, and reasoning.",
      "Role helps focus expertise on the problem you're trying to solve.",
      "Without a role, Copilot may provide a broad answer instead of a targeted one.",
    ],
    exercise: {
      prompt:
        "Complete the ten multiple-choice questions in this module, then submit for feedback.",
    },
    successCheck:
      "Learner submits the lesson quiz and can spot prompts that include or omit a clear Role.",
  },
  {
    slug: "expected-format",
    order: 6,
    kind: "lesson",
    letter: "E",
    title: "E — Expectations: How should the response be presented?",
    durationMinutes: 6,
    summary:
      "Learn how to direct Copilot to shape responses that are ready for immediate use.",
    beats: [
      "Expectations tell Copilot what the final deliverable should look like – length, structure and form – so it matches how the reader will use it.",
      "The same Objective can be delivered as an email, report, presentation, table, checklist, or summary. Expectations choose which.",
      "Without Expectations, Copilot may dump a long generic answer when you needed five bullets. Clear expectations reduce editing and rework.",
      "Copilot performs best when success criteria are clearly defined.",
      "Format, length, tone, and structure influence how useful the response will be.",
      "Expectations help ensure the response matches the audience and purpose.",
      "Tone for the deliverable (“calm, no blame, forwardable”) is part of how the response should be presented — not how the reader “talks” to Copilot.",
    ],
    exercise: {
      prompt:
        "Complete the ten multiple-choice questions in this module, then submit for feedback.",
    },
    successCheck:
      "Learner submits the lesson quiz and can spot prompts that include or omit clear Expectations.",
  },
  {
    slug: "integration",
    order: 7,
    kind: "integration",
    title: "Integration: Putting SCORE in order",
    durationMinutes: 4,
    summary:
      "Learn how to bring SCORE together to diagnose and strengthen prompts using SCORE.",
    beats: [
      "Situation, Context, Objective, Role, and Expectation each solve a different prompting problem.",
      "Missing even one SCORE element can reduce the quality of the response.",
      "The strongest prompts read like workplace assignments, not search queries.",
      "Analysis of a prompt should identify the broken letter(s), not just “the prompt is bad”.",
      "Good prompting is about structure, not complexity.",
      "SCORE provides a repeatable method that works across emails, reports, presentations, analyses, and planning tasks.",
      "The goal is not longer prompts. The goal is clearer prompts.",
    ],
    exercise: {
      prompt:
        "Complete the short integration check, then submit for feedback.",
    },
    successCheck:
      "Learner can assemble SCORE in order and name a sabotaged letter specifically.",
  },
  {
    slug: "capstone",
    order: 8,
    kind: "capstone",
    title: "Capstone: Putting it all together!",
    durationMinutes: 10,
    summary:
      "Apply SCORE to turn a real business problem into a high-performing Copilot prompt.",
    beats: [
      "Workplace requests rarely arrive in a neat SCORE format.",
      "Effective prompting starts with identifying missing information.",
      "Strong prompt writers translate messy situations into structured requests.",
      "SCORE is most valuable when applied to real work, not classroom examples.",
      "Good prompting reduces ambiguity before it reaches Copilot.",
      "Great AI users don't just accept responses; they evaluate them critically.",
      "Trustworthy AI use requires both good prompting and good judgment.",
    ],
    exercise: {
      prompt:
        "Complete Part A (SCORE mapping + strongest prompt) and Part B (trust check), then optionally assemble your full prompt.",
    },
    successCheck:
      "Learner maps SCORE letters, selects a strong full prompt, and applies healthy AI skepticism.",
  },
  {
    slug: "score-card",
    order: 9,
    kind: "takeaway",
    title: "Takeaway: Your SCORE card.",
    durationMinutes: 5,
    summary: "Build your personal SCORE toolkit for everyday prompting.",
    beats: [
      "Same scenario as Module 01 — improved SCORE application should raise your score.",
      "Default Role I should use most often.",
      "Formats and tone constraints I need weekly.",
      "Two things I must never let Copilot invent.",
      "The weak prompt I will stop using.",
    ],
    exercise: {
      prompt:
        "Rewrite your Copilot prompt for the Module 01 scenario, score it, then note your personal SCORE habits.",
    },
    successCheck:
      "Retest score is recorded; learner can name what improved versus baseline.",
  },
];

export const courseMeta = {
  title: "Prompt Like a Pro: The SCORE Method for Copilot",
  tagline:
    "Better prompts lead to better results. Effective prompting improves the quality, accuracy, and relevance of AI-generated responses, enabling users to work more efficiently, make better decisions, and achieve results faster.",
  audience:
    "Managers, supervisors, analysts, engineers, business operators, lawyers, consultants, and client-facing professionals.",
  runtimeMinutes: modules.reduce((sum, mod) => sum + mod.durationMinutes, 0),
  method: "SCORE",
} as const;

export const capstoneBrief = {
  title: "Capstone scenario",
  learnerRole:
    "Plant operations — leadership wants corrective action before the next quarterly review.",
  situation:
    "Your plant's on-time delivery performance fell from 94% to 87% during the last quarter.",
  messyInput: [
    "Increased equipment downtime in Packaging Line 2",
    "Three critical spare-part stockouts",
    "Overtime costs increased by 18%",
    "Customer complaints related to delays increased by 22%",
    "Plant leadership wants corrective actions before the next quarterly review",
  ],
} as const;

export const scoreLegend = [
  { letter: "S", name: "Situation", plain: "What’s happening?" },
  { letter: "C", name: "Context", plain: "What facts does Copilot need?" },
  {
    letter: "O",
    name: "Objective",
    plain: "What exactly do you want Copilot to accomplish?",
  },
  { letter: "R", name: "Role", plain: "Who should Copilot act as?" },
  {
    letter: "E",
    name: "Expectations",
    plain: "How should the response be presented?",
  },
] as const;

export function getModule(slug: string): CourseModule | undefined {
  return modules.find((m) => m.slug === slug);
}

export function getAdjacentModules(slug: string): {
  prev?: CourseModule;
  next?: CourseModule;
} {
  const index = modules.findIndex((m) => m.slug === slug);
  if (index < 0) return {};
  return {
    prev: modules[index - 1],
    next: modules[index + 1],
  };
}
