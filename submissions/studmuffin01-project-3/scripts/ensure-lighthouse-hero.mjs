import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");
const publicDir = join(projectRoot, "public");
const dest = join(publicDir, "lighthouse-hero.png");
const assetsDest = join(projectRoot, "assets", "lighthouse-hero.png");

/** Curated tower+beam sources (never Unsplash sunsets). First hit wins. */
const SOURCE_CANDIDATES = [
  assetsDest,
  // User example — detailed stone tower with beam (primary)
  "C:\\Users\\raarneaud\\.cursor\\projects\\c-Users-raarneaud-Desktop-Ludwitt-hult-cohort-program-submissions-studmuffin01-project-2\\assets\\c__Users_raarneaud_AppData_Roaming_Cursor_User_workspaceStorage_37bf78a2c5f5f2c990427a7b881ca868_images_image-ca9159f2-67bb-41de-8246-066eec435f1a.png",
  // Generated variant from the same examples (fallback)
  "C:\\Users\\raarneaud\\.cursor\\projects\\c-Users-raarneaud-Desktop-Ludwitt-hult-cohort-program-submissions-studmuffin01-project-2\\assets\\lighthouse-hero.png",
];

function main() {
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(join(projectRoot, "assets"), { recursive: true });

  const source = SOURCE_CANDIDATES.find((path) => existsSync(path));
  if (!source) {
    console.warn(
      "No lighthouse hero source found. Place lighthouse-hero.png in assets/."
    );
    return;
  }

  copyFileSync(source, dest);
  if (source !== assetsDest) {
    copyFileSync(source, assetsDest);
  }
  console.log(`Installed lighthouse-hero.png from:\n  ${source}`);
}

try {
  main();
} catch (error) {
  console.warn(
    "ensure-lighthouse-hero: continuing without refreshing public hero image.",
    error instanceof Error ? error.message : error
  );
}
