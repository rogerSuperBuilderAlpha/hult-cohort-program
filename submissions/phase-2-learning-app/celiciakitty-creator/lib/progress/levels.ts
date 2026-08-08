export type LearningLevelId =
  | "legal-beginner"
  | "legal-explorer"
  | "case-analyst"
  | "rights-advocate"
  | "lexlearn-scholar";

export type LearningLevel = {
  id: LearningLevelId;
  title: string;
  description: string;
  /** Minimum completed modules required to reach this level. */
  minCompletedModules: number;
};

export const LEARNING_LEVELS: LearningLevel[] = [
  {
    id: "legal-beginner",
    title: "Legal Beginner",
    description: "Starting your journey into UK law.",
    minCompletedModules: 0,
  },
  {
    id: "legal-explorer",
    title: "Legal Explorer",
    description: "You have completed your first module.",
    minCompletedModules: 1,
  },
  {
    id: "case-analyst",
    title: "Case Analyst",
    description: "You are building confidence across multiple topics.",
    minCompletedModules: 2,
  },
  {
    id: "rights-advocate",
    title: "Rights Advocate",
    description: "You understand how law applies in everyday situations.",
    minCompletedModules: 3,
  },
  {
    id: "lexlearn-scholar",
    title: "LexLearn Scholar",
    description: "You have completed the full LexLearn course.",
    minCompletedModules: 5,
  },
];

export type LevelProgress = {
  current: LearningLevel;
  next: LearningLevel | null;
  completedModules: number;
  totalModules: number;
  /** 0–100 progress toward the next level. */
  progressToNext: number;
};

export function getLearningLevel(completedModules: number): LearningLevel {
  let level = LEARNING_LEVELS[0]!;
  for (const candidate of LEARNING_LEVELS) {
    if (completedModules >= candidate.minCompletedModules) {
      level = candidate;
    }
  }
  return level;
}

export function getLevelProgress(
  completedModules: number,
  totalModules: number
): LevelProgress {
  const current = getLearningLevel(completedModules);
  const currentIndex = LEARNING_LEVELS.findIndex((l) => l.id === current.id);
  const next = LEARNING_LEVELS[currentIndex + 1] ?? null;

  let progressToNext = 100;
  if (next) {
    const span = next.minCompletedModules - current.minCompletedModules;
    const gained = completedModules - current.minCompletedModules;
    progressToNext = span > 0 ? Math.round((gained / span) * 100) : 0;
  }

  return {
    current,
    next,
    completedModules,
    totalModules,
    progressToNext,
  };
}
