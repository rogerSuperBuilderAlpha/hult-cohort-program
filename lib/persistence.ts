import { LEITNER_INTERVALS_MS } from "./leitner";

export type MasteryStatus = "learning" | "mastered";
export type LeitnerBox = 1 | 2 | 3;

export type MasteryEntry = {
  status: MasteryStatus;
  box: LeitnerBox;
  dueAt: string;
  updatedAt: string;
};

export type MasteryMap = Record<string, MasteryEntry>;

const BEST_STREAK_KEY = "triniiq_best_streak";
const MASTERY_KEY = "triniiq_mastery";
const DECK_MODE_KEY = "triniiq_deck_mode";

export type StoredDeckMode = "adaptive" | "explore";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function clampBox(value: number): LeitnerBox {
  if (value <= 1) return 1;
  if (value >= 3) return 3;
  return 2;
}

function dueAtForBox(box: LeitnerBox, from = Date.now()): string {
  return new Date(from + LEITNER_INTERVALS_MS[box]).toISOString();
}

/** Normalize legacy `{ status, updatedAt }` entries into Leitner shape. */
export function normalizeMasteryEntry(
  raw: Partial<MasteryEntry> & { status?: MasteryStatus },
): MasteryEntry | null {
  if (!raw || (raw.status !== "learning" && raw.status !== "mastered")) {
    return null;
  }

  const box = clampBox(
    typeof raw.box === "number"
      ? raw.box
      : raw.status === "mastered"
        ? 3
        : 1,
  );
  const updatedAt =
    typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString();
  const dueAt =
    typeof raw.dueAt === "string" ? raw.dueAt : dueAtForBox(box, Date.now());

  return {
    status: box >= 3 ? "mastered" : "learning",
    box,
    dueAt,
    updatedAt,
  };
}

export function loadBestStreak(): number {
  if (!canUseStorage()) return 0;
  const raw = localStorage.getItem(BEST_STREAK_KEY);
  if (!raw) return 0;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function saveBestStreak(bestStreak: number): void {
  if (!canUseStorage()) return;
  localStorage.setItem(BEST_STREAK_KEY, String(Math.max(0, bestStreak)));
}

export function loadMasteryMap(): MasteryMap {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(MASTERY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<MasteryEntry>>;
    if (!parsed || typeof parsed !== "object") return {};

    const map: MasteryMap = {};
    for (const [id, entry] of Object.entries(parsed)) {
      const normalized = normalizeMasteryEntry(entry);
      if (normalized) map[id] = normalized;
    }
    return map;
  } catch {
    return {};
  }
}

export function saveMasteryMap(map: MasteryMap): void {
  if (!canUseStorage()) return;
  localStorage.setItem(MASTERY_KEY, JSON.stringify(map));
}

/** Promote on success / demote to box 1 on failure; persists immediately. */
export function recordMastery(
  map: MasteryMap,
  questionId: number,
  success: boolean,
  now = Date.now(),
): MasteryMap {
  const key = String(questionId);
  const prev = map[key];
  const prevBox: LeitnerBox = prev?.box ?? 1;
  const box: LeitnerBox = success ? clampBox(prevBox + 1) : 1;
  const status: MasteryStatus = box >= 3 ? "mastered" : "learning";

  const next: MasteryMap = {
    ...map,
    [key]: {
      status,
      box,
      dueAt: dueAtForBox(box, now),
      updatedAt: new Date(now).toISOString(),
    },
  };
  saveMasteryMap(next);
  return next;
}

export function countMastered(map: MasteryMap): number {
  return Object.values(map).filter(
    (entry) => entry.status === "mastered" || entry.box >= 3,
  ).length;
}

export function countDue(map: MasteryMap, now = Date.now()): number {
  return Object.values(map).filter((entry) => {
    const due = Date.parse(entry.dueAt);
    return Number.isFinite(due) && due <= now && entry.box < 3;
  }).length;
}

export function loadDeckMode(): StoredDeckMode {
  if (!canUseStorage()) return "adaptive";
  const raw = localStorage.getItem(DECK_MODE_KEY);
  return raw === "explore" ? "explore" : "adaptive";
}

export function saveDeckMode(mode: StoredDeckMode): void {
  if (!canUseStorage()) return;
  localStorage.setItem(DECK_MODE_KEY, mode);
}
