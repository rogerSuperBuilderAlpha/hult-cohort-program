import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");
const publicDir = join(projectRoot, "public");
const dest = join(publicDir, "welcome-garden-gate.jpg");

const generatedSource = join(
  process.env.USERPROFILE ?? process.env.HOME ?? "",
  ".cursor",
  "projects",
  "c-Users-raarneaud-Desktop-Ludwitt-hult-cohort-program-submissions-studmuffin01-project-1",
  "assets",
  "welcome-garden-gate.jpg"
);

/** Photorealistic garden gate (Unsplash) — used when local generated asset is unavailable. */
const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1761206669539-5278e61078b6?auto=format&fit=crop&w=2560&q=85";

const alternateGeneratedSources = [
  generatedSource,
  join(projectRoot, "assets", "welcome-garden-gate.jpg"),
];

async function downloadFallback() {
  const response = await fetch(FALLBACK_IMAGE_URL);
  if (!response.ok) {
    throw new Error(`Failed to download welcome background (${response.status}).`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(dest, buffer);
  console.log("Downloaded welcome garden-gate background.");
}

async function main() {
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(join(projectRoot, "assets"), { recursive: true });

  for (const source of alternateGeneratedSources) {
    if (existsSync(source)) {
      copyFileSync(source, dest);
      copyFileSync(source, join(projectRoot, "assets", "welcome-garden-gate.jpg"));
      console.log(`Copied welcome-garden-gate.jpg from ${source}`);
      return;
    }
  }

  if (existsSync(dest)) {
    console.log("Welcome background already present in public/.");
    return;
  }

  await downloadFallback();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
