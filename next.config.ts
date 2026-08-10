import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Keep Turbopack rooted on this app, not a parent monorepo lockfile.
  turbopack: {
    root,
  },
  // Course-repo merge brings unrelated packages; don't typecheck them.
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
