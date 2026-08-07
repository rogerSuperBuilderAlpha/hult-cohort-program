import "server-only";

import { ForthAdapter } from "@/lib/forth/forth-adapter";
import { FixtureAdapter } from "@/lib/forth/fixture-adapter";
import type { PMAdapter } from "@/lib/forth/types";

let cached: PMAdapter | null = null;

export function useForthFixtures(): boolean {
  const flag = (process.env.FORTH_USE_FIXTURES || "true").toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") {
    return !process.env.FORTH_API_KEY;
  }
  return true;
}

/** Factory — fixtures by default until §7.0 contract is live. */
export function getPMAdapter(): PMAdapter {
  if (cached) return cached;
  cached = useForthFixtures() ? new FixtureAdapter() : new ForthAdapter();
  return cached;
}

export function resetPMAdapterCache() {
  cached = null;
}
