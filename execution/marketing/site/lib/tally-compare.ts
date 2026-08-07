export type TallySortRow = {
  handle: string;
  up: number;
  mergedAt: Date | null;
};

/** Most upvotes → earliest mergedAt → handle. */
export function compareTallyRows(a: TallySortRow, b: TallySortRow): number {
  if (b.up !== a.up) return b.up - a.up;
  const aTime = a.mergedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const bTime = b.mergedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
  if (aTime !== bTime) return aTime - bTime;
  return a.handle.localeCompare(b.handle);
}
