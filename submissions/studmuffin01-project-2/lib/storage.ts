import type { Message, WorkspaceState } from "@/lib/types";
import { createSeedWorkspace } from "@/lib/seed";
import { safeExternalHref } from "@/lib/urls";

const STORAGE_KEY = "fireside-workspace-v3";
const LEGACY_KEYS = ["fireside-workspace-v1", "fireside-workspace-v2"];

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "quota" | "error" };

function cleanupLegacyKeys(): void {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

function isMemberArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (m) =>
        m &&
        typeof m === "object" &&
        typeof (m as { id?: unknown }).id === "string" &&
        typeof (m as { name?: unknown }).name === "string"
    )
  );
}

function isChannelArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (c) =>
        c &&
        typeof c === "object" &&
        typeof (c as { id?: unknown }).id === "string" &&
        typeof (c as { name?: unknown }).name === "string"
    )
  );
}

function sanitizeMessage(message: Message): Message {
  if (!message.taskLink) return message;
  const url = safeExternalHref(message.taskLink.url);
  if (url) {
    return { ...message, taskLink: { ...message.taskLink, url } };
  }
  const { taskLink: _removed, ...rest } = message;
  return rest;
}

function normalizeWorkspace(parsed: WorkspaceState): WorkspaceState {
  const activeOk = parsed.channels.some((c) => c.id === parsed.activeChannelId);
  return {
    ...parsed,
    activeChannelId: activeOk
      ? parsed.activeChannelId
      : parsed.channels[0].id,
    messages: Array.isArray(parsed.messages)
      ? parsed.messages.map((m) => sanitizeMessage(m))
      : [],
  };
}

function isValidWorkspace(value: unknown): value is WorkspaceState {
  if (!value || typeof value !== "object") return false;
  const parsed = value as WorkspaceState;
  if (!isChannelArray(parsed.channels)) return false;
  if (!isMemberArray(parsed.members)) return false;
  if (!Array.isArray(parsed.messages)) return false;
  if (typeof parsed.currentUserId !== "string") return false;
  if (!parsed.members.some((m) => m.id === parsed.currentUserId)) return false;
  if (typeof parsed.activeChannelId !== "string") return false;
  return true;
}

export function loadWorkspace(): WorkspaceState {
  if (typeof window === "undefined") {
    return createSeedWorkspace();
  }
  cleanupLegacyKeys();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedWorkspace();
    const parsed: unknown = JSON.parse(raw);
    if (!isValidWorkspace(parsed)) {
      return createSeedWorkspace();
    }
    return normalizeWorkspace(parsed);
  } catch {
    return createSeedWorkspace();
  }
}

export function saveWorkspace(state: WorkspaceState): SaveResult {
  if (typeof window === "undefined") return { ok: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return { ok: true };
  } catch (error) {
    const quota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return { ok: false, reason: quota ? "quota" : "error" };
  }
}

export function resetWorkspace(): WorkspaceState {
  const fresh = createSeedWorkspace();
  saveWorkspace(fresh);
  return fresh;
}
