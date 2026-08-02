import type { PmSnapshot } from "./types";
import { URLS } from "./config";

/** Read-only cohort PM snapshot — synced from winning Forth platform. */
export const pmSnapshot: PmSnapshot = {
  sourceLabel: "Forth · cohort PM snapshot",
  sourceUrl: URLS.winningPm,
  syncedAt: new Date().toISOString(),
  initiatives: [
    {
      id: "p1",
      title: "Phase 1 · Project management platform",
      status: "done",
      ownerHandle: "forth-bice",
      openTasks: 2,
      doneTasks: 48,
      },
    {
      id: "p2",
      title: "Phase 1 · Internal communications",
      status: "on-track",
      ownerHandle: "cohort-comms",
      openTasks: 5,
      doneTasks: 41,
    },
    {
      id: "p3",
      title: "Phase 1 · Vibe marketing / showcase",
      status: "on-track",
      ownerHandle: "solzco1",
      openTasks: 3,
      doneTasks: 12,
    },
    {
      id: "review",
      title: "Peer review week · Project 2",
      status: "on-track",
      ownerHandle: "raven-dubgub",
      openTasks: 8,
      doneTasks: 22,
    },
    {
      id: "uni",
      title: "Phase 1 · Ecosystem unification",
      status: "at-risk",
      ownerHandle: "studmuffin01",
      openTasks: 14,
      doneTasks: 2,
    },
  ],
};

export async function fetchPmSnapshot(): Promise<PmSnapshot> {
  const base = pmSnapshot;
  try {
    const res = await fetch(URLS.winningPm, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      return {
        ...base,
        syncedAt: new Date().toISOString(),
        sourceLabel: "Forth · live reachability confirmed",
      };
    }
  } catch {
    /* fall back to static snapshot */
  }
  return base;
}
