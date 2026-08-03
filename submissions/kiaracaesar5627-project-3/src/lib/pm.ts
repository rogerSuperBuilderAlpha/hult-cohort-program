import { readFile } from "fs/promises";
import path from "path";
import type { PmSnapshot } from "@/lib/types";
import { pmUrl } from "@/lib/site";

export async function getPmSnapshot(): Promise<PmSnapshot> {
  const file = path.join(process.cwd(), "data", "pm-status.json");
  const raw = await readFile(file, "utf8");
  const parsed = JSON.parse(raw) as PmSnapshot;
  return {
    ...parsed,
    source: parsed.source || `FlexiFlow · ${pmUrl()}`,
  };
}
