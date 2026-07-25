export const MOTIVATION_LOG_STORAGE_KEY = "initiara-motivation-log";
export const MAX_MOTIVATION_LOG_ENTRIES = 100;
export const MAX_MOTIVATION_LOG_BYTES = 200_000;
export const MOTIVATION_MESSAGE_MAX_LENGTH = 500;
export const MOTIVATION_MEMBER_NAME_MAX_LENGTH = 60;
export const MOTIVATION_TASK_NAME_MAX_LENGTH = 120;

export type MotivationMessageType = "Motivational" | "Congratulatory";

export interface MotivationLogEntry {
  id: string;
  memberName: string;
  messageType: MotivationMessageType;
  message: string;
  taskName: string;
  sentAt: string;
}

export interface NewMotivationLogEntry {
  memberName: string;
  messageType: MotivationMessageType;
  message: string;
  taskName: string;
}

function createLogEntryId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `motivation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function sanitizeText(value: string, maxLength: number): string {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function isValidMessageType(value: unknown): value is MotivationMessageType {
  return value === "Motivational" || value === "Congratulatory";
}

function normalizeLogEntry(record: unknown): MotivationLogEntry | null {
  if (!record || typeof record !== "object") {
    return null;
  }

  const entry = record as Record<string, unknown>;
  const memberName = sanitizeText(String(entry.memberName ?? ""), MOTIVATION_MEMBER_NAME_MAX_LENGTH);
  const message = sanitizeText(String(entry.message ?? ""), MOTIVATION_MESSAGE_MAX_LENGTH);
  const taskName = sanitizeText(String(entry.taskName ?? ""), MOTIVATION_TASK_NAME_MAX_LENGTH);
  const messageType = entry.messageType;
  const sentAt = typeof entry.sentAt === "string" ? entry.sentAt.trim() : "";

  if (!memberName || !message || !isValidMessageType(messageType) || !sentAt) {
    return null;
  }

  const id =
    typeof entry.id === "string" && entry.id.trim() ? entry.id.trim() : createLogEntryId();

  return {
    id,
    memberName,
    messageType,
    message,
    taskName,
    sentAt,
  };
}

export function parseMotivationLog(raw: unknown): MotivationLogEntry[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => normalizeLogEntry(entry))
    .filter((entry): entry is MotivationLogEntry => entry !== null)
    .slice(0, MAX_MOTIVATION_LOG_ENTRIES);
}

export function loadMotivationLog(): MotivationLogEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(MOTIVATION_LOG_STORAGE_KEY);
    if (!raw || raw.length > MAX_MOTIVATION_LOG_BYTES) {
      return [];
    }

    return parseMotivationLog(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveMotivationLog(entries: MotivationLogEntry[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const trimmed = entries.slice(0, MAX_MOTIVATION_LOG_ENTRIES);
    const serialized = JSON.stringify(trimmed);
    if (serialized.length > MAX_MOTIVATION_LOG_BYTES) {
      return;
    }

    localStorage.setItem(MOTIVATION_LOG_STORAGE_KEY, serialized);
  } catch {
    // Ignore quota or serialization errors.
  }
}

export function createMotivationLogEntry(input: NewMotivationLogEntry): MotivationLogEntry | null {
  const memberName = sanitizeText(input.memberName, MOTIVATION_MEMBER_NAME_MAX_LENGTH);
  const message = sanitizeText(input.message, MOTIVATION_MESSAGE_MAX_LENGTH);
  const taskName = sanitizeText(input.taskName, MOTIVATION_TASK_NAME_MAX_LENGTH);

  if (!memberName || !message || !isValidMessageType(input.messageType)) {
    return null;
  }

  return {
    id: createLogEntryId(),
    memberName,
    messageType: input.messageType,
    message,
    taskName,
    sentAt: new Date().toISOString(),
  };
}

export function appendMotivationLogEntry(
  entries: MotivationLogEntry[],
  input: NewMotivationLogEntry
): MotivationLogEntry[] {
  const entry = createMotivationLogEntry(input);
  if (!entry) {
    return entries;
  }

  return [entry, ...entries].slice(0, MAX_MOTIVATION_LOG_ENTRIES);
}

export function formatMotivationLogTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
