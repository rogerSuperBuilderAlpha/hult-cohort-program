import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { UserProgress } from '../types';
import { useAuth } from './AuthContext';
import { loadProgress, persistProgress } from '../services/progressService';

interface ProgressContextType {
  progress: UserProgress;
  loading: boolean;
  completeLesson: (lessonId: string) => void;
  saveQuizScore: (courseId: string, score: number) => void;
  masterFlashcard: (flashcardId: string) => void;
  isLessonComplete: (lessonId: string) => boolean;
  getCourseProgress: (lessonIds: string[]) => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [],
    quizScores: {},
    masteredFlashcards: [],
    streak: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    totalXP: 0,
  });
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setProgress(loadProgress(userId));
    setLoading(false);
  }, [userId]);

  const scheduleSave = useCallback(
    (next: UserProgress) => {
      if (!userId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persistProgress(userId, next), 300);
    },
    [userId]
  );

  const updateProgress = useCallback(
    (updater: (prev: UserProgress) => UserProgress) => {
      setProgress((prev) => {
        const next = updater(prev);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  const completeLesson = useCallback(
    (lessonId: string) => {
      updateProgress((prev) => {
        if (prev.completedLessons.includes(lessonId)) return prev;
        const today = new Date().toISOString().split('T')[0];
        const newStreak =
          prev.lastActiveDate === today
            ? prev.streak
            : prev.lastActiveDate === getYesterday()
              ? prev.streak + 1
              : 1;
        return {
          ...prev,
          completedLessons: [...prev.completedLessons, lessonId],
          totalXP: prev.totalXP + 25,
          streak: newStreak,
          lastActiveDate: today,
        };
      });
    },
    [updateProgress]
  );

  const saveQuizScore = useCallback(
    (courseId: string, score: number) => {
      updateProgress((prev) => ({
        ...prev,
        quizScores: { ...prev.quizScores, [courseId]: Math.max(prev.quizScores[courseId] ?? 0, score) },
        totalXP: prev.totalXP + score * 10,
      }));
    },
    [updateProgress]
  );

  const masterFlashcard = useCallback(
    (flashcardId: string) => {
      updateProgress((prev) => {
        if (prev.masteredFlashcards.includes(flashcardId)) return prev;
        return {
          ...prev,
          masteredFlashcards: [...prev.masteredFlashcards, flashcardId],
          totalXP: prev.totalXP + 5,
        };
      });
    },
    [updateProgress]
  );

  const isLessonComplete = useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress.completedLessons]
  );

  const getCourseProgress = useCallback(
    (lessonIds: string[]) => {
      if (lessonIds.length === 0) return 0;
      const completed = lessonIds.filter((id) => progress.completedLessons.includes(id)).length;
      return Math.round((completed / lessonIds.length) * 100);
    },
    [progress.completedLessons]
  );

  return (
    <ProgressContext.Provider
      value={{ progress, loading, completeLesson, saveQuizScore, masterFlashcard, isLessonComplete, getCourseProgress }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
}
