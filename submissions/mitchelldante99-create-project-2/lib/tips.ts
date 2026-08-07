export interface Tip {
  id: string;
  title: string;
  body: string;
}

// Static content — no backend needed to serve these, just to track what's been viewed.
export const TIPS: Tip[] = [
  {
    id: "spaced-repetition",
    title: "Use spaced repetition",
    body: "Review material at increasing intervals (1 day, 3 days, 1 week, 1 month) instead of cramming. This fights the forgetting curve far more effectively than re-reading notes once.",
  },
  {
    id: "active-recall",
    title: "Practice active recall",
    body: "Close the book and try to write down what you remember before checking. Struggling to retrieve information strengthens memory more than passively re-reading it.",
  },
  {
    id: "interleaving",
    title: "Interleave your topics",
    body: "Mix different subjects or problem types in a single study session instead of blocking one topic at a time. It feels harder but produces better long-term retention.",
  },
  {
    id: "feynman-technique",
    title: "Teach it to explain it",
    body: "Explain the concept out loud in plain language, as if teaching a beginner. Gaps in your explanation reveal exactly what you don't understand yet.",
  },
  {
    id: "pomodoro",
    title: "Work in focused sprints",
    body: "Study in 25-minute focused blocks with 5-minute breaks. Short sprints reduce burnout and keep attention sharp longer than open-ended study sessions.",
  },
  {
    id: "sleep-consolidation",
    title: "Protect your sleep",
    body: "Memory consolidation happens during sleep. An all-nighter before an exam usually hurts recall more than it helps — a rested brain retrieves information faster.",
  },
];
