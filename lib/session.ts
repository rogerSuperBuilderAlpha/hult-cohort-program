import {
  buildAdaptiveSession,
  buildExploreSession,
  buildRematchDeck,
} from "./leitner";
import type { MasteryMap } from "./persistence";
import type { CategoryFilter, Question } from "./questions";
import { filterQuestionsByCategory, questionBank } from "./questions";

export type SessionPhase = "practice" | "rematch" | "summary";
export type DeckMode = "adaptive" | "explore";

export type SessionComposition = {
  weak: number;
  due: number;
  fresh: number;
  strong: number;
  total: number;
};

export type SessionState = {
  selectedCategory: CategoryFilter;
  deckMode: DeckMode;
  questions: Question[];
  index: number;
  flipped: boolean;
  selectedOption: string | null;
  score: number;
  streak: number;
  bestStreak: number;
  seconds: number;
  phase: SessionPhase;
  missedQuestions: Question[];
  showExplanation: boolean;
  lastSuccess: boolean | null;
  practiceScore: number;
  practiceTotal: number;
  rematchScore: number;
  rematchTotal: number;
  composition: SessionComposition | null;
};

export type SessionAction =
  | {
      type: "INIT_SESSION";
      category: CategoryFilter;
      deckMode: DeckMode;
      bestStreak?: number;
      mastery: MasteryMap;
    }
  | { type: "HYDRATE_BEST_STREAK"; bestStreak: number }
  | { type: "TICK" }
  | { type: "SET_FLIPPED"; flipped: boolean }
  | { type: "SELECT_OPTION"; option: string }
  | {
      type: "SUBMIT_ANSWER";
      success: boolean;
      selectedOption?: string | null;
    }
  | { type: "CONTINUE_AFTER_FEEDBACK" }
  | { type: "START_REMATCH" }
  | { type: "SKIP_TO_SUMMARY" };

const emptyComposition: SessionComposition = {
  weak: 0,
  due: 0,
  fresh: 0,
  strong: 0,
  total: 0,
};

/** Empty shell for SSR / first paint — call INIT_SESSION on the client. */
export function createInitialSessionState(
  bestStreak = 0,
  category: CategoryFilter = "All",
  deckMode: DeckMode = "adaptive",
): SessionState {
  return {
    selectedCategory: category,
    deckMode,
    questions: [],
    index: 0,
    flipped: false,
    selectedOption: null,
    score: 0,
    streak: 0,
    bestStreak,
    seconds: 0,
    phase: "practice",
    missedQuestions: [],
    showExplanation: false,
    lastSuccess: null,
    practiceScore: 0,
    practiceTotal: 0,
    rematchScore: 0,
    rematchTotal: 0,
    composition: null,
  };
}

function advanceOrComplete(state: SessionState): SessionState {
  const isLast = state.index >= state.questions.length - 1;

  if (!isLast) {
    return {
      ...state,
      index: state.index + 1,
      flipped: false,
      selectedOption: null,
      showExplanation: false,
      lastSuccess: null,
    };
  }

  if (state.phase === "rematch") {
    return {
      ...state,
      flipped: false,
      selectedOption: null,
      showExplanation: false,
      lastSuccess: null,
      phase: "summary",
      rematchTotal: state.questions.length,
    };
  }

  return {
    ...state,
    flipped: false,
    selectedOption: null,
    showExplanation: false,
    lastSuccess: null,
    phase: "summary",
    practiceScore: state.score,
    practiceTotal: state.questions.length,
  };
}

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case "INIT_SESSION": {
      const pool = filterQuestionsByCategory(questionBank, action.category);
      const builder =
        action.deckMode === "explore"
          ? buildExploreSession
          : buildAdaptiveSession;
      const { questions, composition } = builder(pool, action.mastery);
      return {
        ...createInitialSessionState(
          action.bestStreak ?? state.bestStreak,
          action.category,
          action.deckMode,
        ),
        questions,
        composition,
        bestStreak: action.bestStreak ?? state.bestStreak,
        practiceTotal: questions.length,
      };
    }
    case "HYDRATE_BEST_STREAK":
      return {
        ...state,
        bestStreak: Math.max(state.bestStreak, action.bestStreak),
      };
    case "TICK":
      if (state.phase === "summary") return state;
      return { ...state, seconds: state.seconds + 1 };
    case "SET_FLIPPED":
      return { ...state, flipped: action.flipped };
    case "SELECT_OPTION":
      return { ...state, selectedOption: action.option };
    case "SUBMIT_ANSWER": {
      if (state.phase === "summary" || state.showExplanation) return state;
      const current = state.questions[state.index];
      if (!current) return state;

      const score = action.success ? state.score + 1 : state.score;
      const streak = action.success ? state.streak + 1 : 0;
      const bestStreak = Math.max(state.bestStreak, streak);
      const missedQuestions =
        state.phase === "practice" && !action.success
          ? state.missedQuestions.some((q) => q.id === current.id)
            ? state.missedQuestions
            : [...state.missedQuestions, current]
          : state.missedQuestions;

      const rematchScore =
        state.phase === "rematch" && action.success
          ? state.rematchScore + 1
          : state.rematchScore;

      return {
        ...state,
        score,
        streak,
        bestStreak,
        missedQuestions,
        rematchScore,
        selectedOption:
          action.selectedOption !== undefined
            ? action.selectedOption
            : state.selectedOption,
        showExplanation: true,
        lastSuccess: action.success,
        flipped: current.type === "flashcard" ? true : state.flipped,
      };
    }
    case "CONTINUE_AFTER_FEEDBACK": {
      if (!state.showExplanation) return state;
      return advanceOrComplete(state);
    }
    case "START_REMATCH": {
      if (state.missedQuestions.length === 0) return state;
      const questions = buildRematchDeck(state.missedQuestions);
      return {
        ...state,
        phase: "rematch",
        questions,
        index: 0,
        score: 0,
        streak: 0,
        flipped: false,
        selectedOption: null,
        showExplanation: false,
        lastSuccess: null,
        rematchScore: 0,
        rematchTotal: questions.length,
        composition: emptyComposition,
      };
    }
    case "SKIP_TO_SUMMARY":
      return {
        ...state,
        phase: "summary",
        showExplanation: false,
        lastSuccess: null,
        practiceScore: state.practiceScore || state.score,
        practiceTotal: state.practiceTotal || state.questions.length,
      };
    default:
      return state;
  }
}

export function sessionProgress(state: SessionState): number {
  if (state.questions.length === 0) return 0;
  if (state.phase === "summary") return 100;
  return ((state.index + 1) / state.questions.length) * 100;
}

export function isSessionActive(state: SessionState): boolean {
  return state.phase === "practice" || state.phase === "rematch";
}

export function hasStartedPractice(state: SessionState): boolean {
  return (
    state.phase === "practice" &&
    (state.index > 0 || state.score > 0 || state.showExplanation)
  );
}
