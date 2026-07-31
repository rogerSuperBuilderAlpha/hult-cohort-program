import { existsSync } from "node:fs";
import { join } from "node:path";
import { LIGHTHOUSE_HERO_IMAGE } from "@/lib/hero";

function getLighthouseHeroUrl(): string | null {
  const localPath = join(process.cwd(), "public", "lighthouse-hero.png");
  return existsSync(localPath) ? LIGHTHOUSE_HERO_IMAGE : null;
}

export default function LighthouseHeroBackground() {
  const backgroundUrl = getLighthouseHeroUrl();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {backgroundUrl ? (
        <div
          className="absolute inset-0 scale-105 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url("${backgroundUrl}")`,
            /* Keep the tower readable; image has lighthouse on the left */
            backgroundPosition: "35% center",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--bg)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-[#07090d]/75 via-[#0a0e14]/40 to-[#07090d]/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(7,9,13,0.5)_100%)]" />
    </div>
  );
}
