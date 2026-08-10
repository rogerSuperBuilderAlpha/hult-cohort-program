const STORAGE_KEY = "score-course-modules-complete-v1";
export const MODULE_COMPLETE_EVENT = "score-course-module-complete";

function readSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function isModuleComplete(moduleSlug: string): boolean {
  return readSet().has(moduleSlug);
}

export function getCompletedModules(): string[] {
  return [...readSet()];
}

export function markModuleComplete(moduleSlug: string) {
  const set = readSet();
  set.add(moduleSlug);
  writeSet(set);
  window.dispatchEvent(
    new CustomEvent(MODULE_COMPLETE_EVENT, { detail: { moduleSlug } }),
  );
}

/** Replace the completed-module set (used by course / retest reset). */
export function replaceCompletedModules(slugs: string[]) {
  writeSet(new Set(slugs));
  window.dispatchEvent(
    new CustomEvent(MODULE_COMPLETE_EVENT, { detail: { moduleSlug: "*" } }),
  );
}
