export interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number;
  videoUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  quizzes: QuizQuestion[];
  flashcards: Flashcard[];
  totalLessons: number;
}

export interface UserProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  masteredFlashcards: string[];
  streak: number;
  lastActiveDate: string;
  totalXP: number;
}
