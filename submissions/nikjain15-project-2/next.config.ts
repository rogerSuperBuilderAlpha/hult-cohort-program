import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @cohort/core is vendored inside the submission (vendor/cohort-core) as committed compiled
  // output, and depended on via `file:./vendor/cohort-core`. That keeps the submission fully
  // self-contained — a fresh clone of just this folder, and the isolated deploy repo, both
  // build with no pre-build and no sibling. The canonical source lives in submissions/
  // cohort-common; `npm run sync:core` regenerates the vendored copy (rally-tech-spec §3).

  // firebase-admin must NOT be bundled by Turbopack for the server routes: bundling rewrites
  // its deps' dynamic import() of the ESM-only `jose` (via jwks-rsa) into require(), which
  // throws ERR_REQUIRE_ESM at runtime on Vercel (verifyIdToken / all admin routes 500). Marking
  // it external loads it from node_modules with its dynamic imports intact. Local dev/emulator
  // never hit this because the emulator path skips jwks-rsa and dev doesn't bundle externals.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
