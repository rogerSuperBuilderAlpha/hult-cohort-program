export type AchievementId =
  | "first-lesson"
  | "first-quiz"
  | "civil-law-started"
  | "criminal-law-started"
  | "five-correct-answers";

export type AchievementDefinition = {
  id: AchievementId;
  title: string;
  description: string;
  icon: "book" | "clipboard" | "scale" | "shield" | "star";
};

export type AchievementsState = {
  unlocked: AchievementId[];
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first-lesson",
    title: "First Lesson",
    description: "Complete your first lesson.",
    icon: "book",
  },
  {
    id: "first-quiz",
    title: "First Quiz",
    description: "Pass your first module quiz.",
    icon: "clipboard",
  },
  {
    id: "civil-law-started",
    title: "Civil Law Started",
    description: "Begin exploring civil law modules.",
    icon: "scale",
  },
  {
    id: "criminal-law-started",
    title: "Criminal Law Started",
    description: "Begin exploring criminal law modules.",
    icon: "shield",
  },
  {
    id: "five-correct-answers",
    title: "Five Correct Answers",
    description: "Answer five quiz questions correctly in total.",
    icon: "star",
  },
];

export const DEFAULT_ACHIEVEMENTS: AchievementsState = { unlocked: [] };
