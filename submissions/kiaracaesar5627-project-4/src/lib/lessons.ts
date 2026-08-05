export type InterviewRound = {
  slug: string;
  stage: "Behavioral" | "Coding" | "System design" | "Closing";
  title: string;
  minutes: number;
  summary: string;
  /** What the interviewer says to open the round */
  interviewer: string;
  /** How the candidate should work the round */
  playbook: string[];
  debrief: {
    prompt: string;
    choices: string[];
    answerIndex: number;
    explain: string;
  };
};

export const ROUNDS: InterviewRound[] = [
  {
    slug: "behavioral-star",
    stage: "Behavioral",
    title: "Tell me about a conflict",
    minutes: 12,
    summary: "STAR-format behavioral round — situation, tension, your move, the outcome.",
    interviewer:
      "Tell me about a time you disagreed with a teammate on a technical decision. What happened, and what would you do differently?",
    playbook: [
      "Open with Situation in one sentence: team, stakes, timeline.",
      "Task: name your responsibility without blaming the other person.",
      "Action: 2–3 concrete steps you took (data, prototype, escalation path).",
      "Result: business or product outcome, plus one learning you still use.",
      "If you stall, restate the disagreement as a shared goal — interviewers reward ownership, not winning the argument.",
    ],
    debrief: {
      prompt: "In STAR answers, the weakest answers usually skip:",
      choices: [
        "A named Result with evidence",
        "The company name",
        "Multiple programming languages",
        "A joke to build rapport",
      ],
      answerIndex: 0,
      explain: "Interviewers need proof the story mattered — impact closes the loop.",
    },
  },
  {
    slug: "coding-screen",
    stage: "Coding",
    title: "Live coding screen",
    minutes: 25,
    summary: "A shared-editor round: clarify, choose a pattern, talk while you code, then test.",
    interviewer:
      "Here’s a coding problem. Talk me through your approach before you write code. What are the edge cases?",
    playbook: [
      "Repeat the prompt and ask 2 clarifying questions (constraints, duplicates, mutability).",
      "State brute force first, then the target complexity — show you can trade space for time.",
      "Name the pattern out loud (hash map, two pointers, BFS) before typing.",
      "Write a happy-path solution, then walk 2 edge cases and a complexity line.",
      "If stuck for 90 seconds, narrate what you would try next — silence fails the screen more than a wrong turn.",
    ],
    debrief: {
      prompt: "In a coding interview, the first thing to do after hearing the prompt is usually:",
      choices: [
        "Start typing immediately",
        "Clarify constraints and restate the problem",
        "Ask for the answer key",
        "Switch languages",
      ],
      answerIndex: 1,
      explain: "Clarifying shows judgment and prevents solving the wrong problem.",
    },
  },
  {
    slug: "system-design",
    stage: "System design",
    title: "Design a feed",
    minutes: 30,
    summary: "Open-ended design round: requirements, API, data model, scale, and tradeoffs.",
    interviewer:
      "Design a news feed for 10 million daily users. Walk me from requirements to a first architecture.",
    playbook: [
      "Lock functional requirements (post, follow, read feed) and non-functional (latency, freshness).",
      "Draw a simple path: client → API → write path → read path → storage.",
      "Call out fan-out on write vs fan-out on read and when you’d choose each.",
      "Name bottlenecks (hot users, cache stampede) and one mitigation each.",
      "End with what you’d measure in week one of production.",
    ],
    debrief: {
      prompt: "A strong system-design answer usually starts by:",
      choices: [
        "Listing every AWS service you know",
        "Agreeing on requirements and scale assumptions",
        "Drawing Kubernetes first",
        "Skipping the data model",
      ],
      answerIndex: 1,
      explain: "Shared assumptions keep the rest of the design coherent and testable.",
    },
  },
  {
    slug: "closing-questions",
    stage: "Closing",
    title: "Your questions",
    minutes: 8,
    summary: "The closing round — questions that show you evaluate the role, not just sell yourself.",
    interviewer:
      "That’s all from our side. What questions do you have for me about the team or the role?",
    playbook: [
      "Ask about success in the first 90 days — shows you think in outcomes.",
      "Ask how the team makes technical decisions when opinions diverge.",
      "Ask what is hard about the product right now (honesty signal).",
      "Avoid salary, vacation, or “what does your company do?” — those belong elsewhere.",
      "Leave one thoughtful follow-up that references something they said earlier.",
    ],
    debrief: {
      prompt: "The best closing questions usually focus on:",
      choices: [
        "Vacation policy only",
        "How success and decisions work on the team",
        "Whether you can work remote forever",
        "The interviewer’s personal salary",
      ],
      answerIndex: 1,
      explain: "You’re interviewing them too — process and success criteria reveal the job.",
    },
  },
];

export function getRound(slug: string): InterviewRound | undefined {
  return ROUNDS.find((r) => r.slug === slug);
}

/** Back-compat alias for older imports */
export const LESSONS = ROUNDS;
export function getLesson(slug: string) {
  return getRound(slug);
}
