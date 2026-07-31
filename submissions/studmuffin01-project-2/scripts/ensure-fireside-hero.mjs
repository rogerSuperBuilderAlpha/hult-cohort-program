import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");
const publicDir = join(projectRoot, "public");
const dest = join(publicDir, "fireside-hero.jpg");
const assetsDest = join(projectRoot, "assets", "fireside-hero.jpg");

/**
 * Group chatting around a campfire (Unsplash) — not caravan/camping gear.
 * Prefer assets/fireside-hero.jpg when present. Never fail the production build
 * if the remote download is blocked (Vercel / SSL / network).
 */
const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=2400&q=85";

async function downloadFallback() {
  const response = await fetch(FALLBACK_IMAGE_URL);
  if (!response.ok) {
    throw new Error(`Failed to download Fireside hero (${response.status}).`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(dest, buffer);
  writeFileSync(assetsDest, buffer);
  console.log("Downloaded fireside-hero.jpg (people around a campfire).");
}

async function main() {
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(join(projectRoot, "assets"), { recursive: true });

  if (existsSync(dest)) {
    console.log("fireside-hero.jpg already present in public/.");
    return;
  }

  if (existsSync(assetsDest)) {
    copyFileSync(assetsDest, dest);
    console.log("Copied fireside-hero.jpg from assets/.");
    return;
  }

  try {
    await downloadFallback();
  } catch (error) {
    console.warn(
      "Hero image download skipped — landing will use the remote Unsplash URL.",
      error instanceof Error ? error.message : error
    );
  }
}

main().catch((error) => {
  console.warn(
    "ensure-fireside-hero: continuing without local hero image.",
    error instanceof Error ? error.message : error
  );
});
