import {
  BASELINE_STORAGE_KEY,
  RETEST_STORAGE_KEY,
  type BaselineRecord,
} from "@/content/baseline-assessment";

function read(key: string): BaselineRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BaselineRecord;
    if (parsed?.version !== 1 || !parsed.result) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(key: string, record: BaselineRecord) {
  window.localStorage.setItem(key, JSON.stringify(record));
}

export function loadBaseline(): BaselineRecord | null {
  return read(BASELINE_STORAGE_KEY);
}

export function saveBaseline(record: BaselineRecord) {
  // Baseline is a one-shot snapshot — never overwrite once scored.
  if (loadBaseline()?.result) return;
  write(BASELINE_STORAGE_KEY, { ...record, phase: "baseline" });
}

export function loadRetest(): BaselineRecord | null {
  return read(RETEST_STORAGE_KEY);
}

export function saveRetest(record: BaselineRecord) {
  write(RETEST_STORAGE_KEY, { ...record, phase: "retest" });
}

export function clearRetest() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RETEST_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearBaseline() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BASELINE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
