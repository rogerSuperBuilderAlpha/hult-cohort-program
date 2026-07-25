import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  WELCOME_GATE_IMAGE,
  WELCOME_GATE_IMAGE_REMOTE,
} from "@/lib/auth/welcomeStyles";

function getBackgroundImageUrl(): string {
  const localPath = join(process.cwd(), "public", "welcome-garden-gate.jpg");
  return existsSync(localPath) ? WELCOME_GATE_IMAGE : WELCOME_GATE_IMAGE_REMOTE;
}

export default function GatewayBackground() {
  const backgroundUrl = getBackgroundImageUrl();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${backgroundUrl}")` }}
      />

      {/* Warm golden-hour wash — kept light so the photo reads clearly */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 via-emerald-950/10 to-stone-900/25" />

      {/* Left-side legibility for welcome copy */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />

      {/* Right-side soft panel glow behind the sign-in card */}
      <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-gradient-to-l from-black/30 via-black/10 to-transparent lg:max-w-2xl" />

      {/* Bottom grounding */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/40 to-transparent" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(15,23,15,0.35)_100%)]" />
    </div>
  );
}
