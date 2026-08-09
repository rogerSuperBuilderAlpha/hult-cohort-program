import { UserProgress } from '../types';

const defaultProgress = (): UserProgress => ({
  completedLessons: [],
  quizScores: {},
  masteredFlashcards: [],
  streak: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalXP: 0,
});

function storageKey(userId: string) {
  return `@learnhub_progress_${userId}`;
}

export function loadProgress(userId: string): UserProgress {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw) as UserProgress;
  } catch {
    // ignore
  }
  return defaultProgress();
}

export function persistProgress(userId: string, progress: UserProgress): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(progress));
}
