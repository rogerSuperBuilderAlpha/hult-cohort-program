import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  FIRESIDE_HERO_IMAGE,
  FIRESIDE_HERO_IMAGE_REMOTE,
} from "@/lib/hero";

function getFiresideHeroUrl(): string {
  const localPath = join(process.cwd(), "public", "fireside-hero.jpg");
  return existsSync(localPath) ? FIRESIDE_HERO_IMAGE : FIRESIDE_HERO_IMAGE_REMOTE;
}

type Props = {
  /** Stronger left wash for sign-in copy; softer for landing. */
  variant?: "auth" | "landing";
};

export default function FiresideHeroBackground({
  variant = "auth",
}: Props) {
  const backgroundUrl = getFiresideHeroUrl();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${backgroundUrl}")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#3a120c]/50 via-[#8a1a12]/25 to-[#1a1210]/55" />
      <div
        className={`absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent ${
          variant === "landing" ? "via-black/20" : ""
        }`}
      />
      <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-gradient-to-l from-black/35 via-black/10 to-transparent lg:max-w-2xl" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#1a1210]/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(26,18,16,0.4)_100%)]" />
    </div>
  );
}
