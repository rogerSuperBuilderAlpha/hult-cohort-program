export type ModuleId = "1" | "2" | "3" | "4" | "5";

export type LawCategory = "Civil Law" | "Criminal Law" | "Everyday Law";

export type ModuleMeta = {
  id: ModuleId;
  title: string;
  description: string;
  category: LawCategory;
  /** When false, lesson/quiz content is not yet available. */
  hasContent: boolean;
};

export type KeyTerm = {
  term: string;
  definition: string;
};

export type KnowledgeCheckQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type LessonContent = {
  moduleId: ModuleId;
  title: string;
  learningObjective: string;
  whyItMatters: string;
  topics: string[];
  explanation: string[];
  scenario: {
    title: string;
    narrative: string[];
    analysis: string[];
    /** Heading above scenario analysis points. */
    analysisHeading?: string;
  };
  /** Links to a Case Spotlight entry in `lib/case-spotlights.ts`. */
  caseSpotlightId?: string;
  /** Links to a Statute Spotlight entry in `lib/statute-spotlights.ts`. */
  statuteSpotlightId?: string;
  keyTerms: KeyTerm[];
  knowledgeCheck: KnowledgeCheckQuestion;
  takeaways: string[];
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type QuizContent = {
  moduleId: ModuleId;
  title: string;
  intro: string;
  questions: QuizQuestion[];
  passThreshold: number;
};

export type ModuleProgress = {
  lessonCompleted: boolean;
  quizCompleted: boolean;
  quizScore?: number;
  quizTotal?: number;
  lastVisited?: string;
};

export type CourseProgress = {
  modules: Partial<Record<ModuleId, ModuleProgress>>;
  /** Cumulative correct quiz answers across all submissions. */
  totalCorrectAnswers?: number;
};

export type ModuleDisplayStatus = "locked" | "available" | "in-progress" | "completed";
