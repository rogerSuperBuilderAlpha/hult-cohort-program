import { seedComms } from "./seed";

let seeded = false;

/** Ensures schema + demo data exist (safe to call repeatedly). */
export async function ensureSeeded() {
  if (seeded) return;
  await seedComms();
  seeded = true;
}
