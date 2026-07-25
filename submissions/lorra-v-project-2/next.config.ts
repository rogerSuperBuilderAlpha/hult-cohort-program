import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack root to this package (npm scripts run from package dir).
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
