/** Browser counters that make Live Summary feel current during a demo session. */
export const LIVE_COUNTERS_KEY = "lighthouse-live-counters-v1";

export type LiveCounters = {
  introRequests: number;
  rsvps: number;
};

export const EMPTY_COUNTERS: LiveCounters = {
  introRequests: 0,
  rsvps: 0,
};

export function readLiveCounters(): LiveCounters {
  return parseLiveCountersRaw(getLiveCountersRaw());
}

/** Stable string snapshot for useSyncExternalStore (Object.is compares). */
export function getLiveCountersRaw(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(LIVE_COUNTERS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function getServerLiveCountersRaw(): string {
  return "";
}

export function parseLiveCountersRaw(raw: string): LiveCounters {
  if (!raw) return EMPTY_COUNTERS;
  try {
    const parsed = JSON.parse(raw) as Partial<LiveCounters>;
    return {
      introRequests: Number(parsed.introRequests) || 0,
      rsvps: Number(parsed.rsvps) || 0,
    };
  } catch {
    return EMPTY_COUNTERS;
  }
}

export function subscribeLiveCounters(onStoreChange: () => void): () => void {
  window.addEventListener("lighthouse:live-counters", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("lighthouse:live-counters", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export function bumpLiveCounter(kind: keyof LiveCounters): LiveCounters {
  const next = { ...readLiveCounters() };
  next[kind] += 1;
  window.localStorage.setItem(LIVE_COUNTERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("lighthouse:live-counters"));
  return next;
}
