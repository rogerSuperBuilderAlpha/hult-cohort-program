export type InterviewTrack = "behavioral" | "system-design" | "algorithms";

export type InterviewQuestion = {
  id: string;
  track: InterviewTrack;
  prompt: string;
  guidance: string;
  samplePoints: string[];
};

export const TRACKS: Array<{
  id: InterviewTrack;
  title: string;
  blurb: string;
}> = [
  {
    id: "behavioral",
    title: "Behavioral",
    blurb: "STAR stories for leadership, conflict, and ownership.",
  },
  {
    id: "system-design",
    title: "System design",
    blurb: "Tradeoffs, scale, and clear architecture narratives.",
  },
  {
    id: "algorithms",
    title: "Algorithms",
    blurb: "Talk through complexity, edge cases, and approach.",
  },
];

export const QUESTIONS: InterviewQuestion[] = [
  {
    id: "beh-conflict",
    track: "behavioral",
    prompt:
      "Tell me about a time you disagreed with a teammate on a technical decision. What did you do?",
    guidance: "Use STAR. Emphasize listening, evidence, and the outcome.",
    samplePoints: [
      "Name the disagreement without blaming",
      "Show how you sought data or a small experiment",
      "Close with what shipped and what you learned",
    ],
  },
  {
    id: "beh-failure",
    track: "behavioral",
    prompt: "Describe a project that failed or missed its goal. How did you recover?",
    guidance: "Own the miss, show diagnosis, and prove growth.",
    samplePoints: [
      "State the goal and what slipped",
      "Explain root cause without excuses",
      "Describe the fix and prevention steps",
    ],
  },
  {
    id: "beh-impact",
    track: "behavioral",
    prompt:
      "Walk me through a time you delivered measurable impact under tight constraints.",
    guidance: "Quantify outcomes. Show prioritization under pressure.",
    samplePoints: [
      "Constraints: time, people, or scope",
      "What you cut and why",
      "Metric before/after",
    ],
  },
  {
    id: "sd-url",
    track: "system-design",
    prompt: "Design a URL shortener that will serve 100M redirects per day.",
    guidance: "Cover API, storage, uniqueness, caching, and analytics.",
    samplePoints: [
      "Write path vs read-heavy redirect path",
      "ID generation and collision handling",
      "Cache + DB partitioning choices",
    ],
  },
  {
    id: "sd-feed",
    track: "system-design",
    prompt: "Design a news feed for a social app with 50M daily active users.",
    guidance: "Fan-out strategies, ranking, and freshness vs cost.",
    samplePoints: [
      "Push vs pull fan-out tradeoff",
      "Timeline storage model",
      "Hot celebrities / celebrity problem",
    ],
  },
  {
    id: "sd-rate",
    track: "system-design",
    prompt: "Design a distributed rate limiter for a public API.",
    guidance: "Algorithms, consistency, and multi-region behavior.",
    samplePoints: [
      "Token bucket vs sliding window",
      "Redis / central counter vs local approx",
      "What happens on partition",
    ],
  },
  {
    id: "algo-two-sum",
    track: "algorithms",
    prompt:
      "Explain how you would solve Two Sum for an unsorted array. Discuss time and space.",
    guidance: "Hash map approach, edge cases, and complexity.",
    samplePoints: [
      "Brute force baseline",
      "Hash map one-pass",
      "Duplicates and no-solution cases",
    ],
  },
  {
    id: "algo-lru",
    track: "algorithms",
    prompt: "How would you implement an LRU cache with O(1) get and put?",
    guidance: "Hash map + doubly linked list structure.",
    samplePoints: [
      "Why a list alone is not enough",
      "Move-to-front on access",
      "Eviction of the tail",
    ],
  },
  {
    id: "algo-merge",
    track: "algorithms",
    prompt:
      "You have K sorted lists. How do you merge them efficiently into one sorted list?",
    guidance: "Heap-based merge and complexity in terms of N and K.",
    samplePoints: [
      "Naive concat + sort cost",
      "Min-heap of list heads",
      "O(N log K) explanation",
    ],
  },
];

export function questionsForTrack(track: InterviewTrack) {
  return QUESTIONS.filter((q) => q.track === track);
}

export function getQuestion(id: string) {
  return QUESTIONS.find((q) => q.id === id);
}
