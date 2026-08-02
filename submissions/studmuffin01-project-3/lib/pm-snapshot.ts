import type { PmSnapshot } from "@/lib/types";
import { forthUrl } from "@/lib/links";

/**
 * Illustrative read-only snapshot shaped like cohort PM data.
 * Not a live Forth API sync — labeled as demo in the UI.
 */
export const pmSnapshot: PmSnapshot = {
  sourceLabel: "Forth · illustrative PM snapshot (demo)",
  sourceUrl: forthUrl(),
  syncedAt: "2026-07-30T18:00:00.000Z",
  initiatives: [
    {
      id: "p1",
      title: "Phase 1 · Project management platform",
      status: "done",
      ownerHandle: "studmuffin01",
      openTasks: 0,
      doneTasks: 12,
      updatedAt: "2026-07-22T21:00:00.000Z",
    },
    {
      id: "p2",
      title: "Phase 1 · Internal communications (Fireside)",
      status: "done",
      ownerHandle: "studmuffin01",
      openTasks: 1,
      doneTasks: 14,
      updatedAt: "2026-07-29T20:00:00.000Z",
    },
    {
      id: "p3",
      title: "Phase 1 · Public showcase (Lighthouse)",
      status: "done",
      ownerHandle: "studmuffin01",
      openTasks: 0,
      doneTasks: 10,
      updatedAt: "2026-07-31T22:00:00.000Z",
    },
    {
      id: "uni",
      title: "Phase 1 · Ecosystem unification",
      status: "at-risk",
      ownerHandle: "studmuffin01",
      openTasks: 8,
      doneTasks: 1,
      updatedAt: "2026-07-30T12:00:00.000Z",
    },
    {
      id: "p2a",
      title: "Peer review week · Project 2",
      status: "on-track",
      ownerHandle: "nikjain15",
      openTasks: 3,
      doneTasks: 9,
      updatedAt: "2026-07-30T15:30:00.000Z",
    },
  ],
};
