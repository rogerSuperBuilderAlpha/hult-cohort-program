import type { PmSnapshot } from "@/lib/types";
import { forthUrl } from "@/lib/links";

/** Daily-synced read-only snapshot from the cohort PM platform (Forth / Initiara). */
export const pmSnapshot: PmSnapshot = {
  sourceLabel: "Forth · cohort PM snapshot",
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
      status: "on-track",
      ownerHandle: "studmuffin01",
      openTasks: 6,
      doneTasks: 4,
      updatedAt: "2026-07-30T17:00:00.000Z",
    },
    {
      id: "uni",
      title: "Phase 1 · Ecosystem unification",
      status: "at-risk",
      ownerHandle: "mayachen",
      openTasks: 8,
      doneTasks: 1,
      updatedAt: "2026-07-30T12:00:00.000Z",
    },
    {
      id: "p2a",
      title: "Peer review week · Project 2",
      status: "on-track",
      ownerHandle: "jblake",
      openTasks: 3,
      doneTasks: 9,
      updatedAt: "2026-07-30T15:30:00.000Z",
    },
  ],
};
