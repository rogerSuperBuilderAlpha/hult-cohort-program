import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avatar (5 MB) + project cover (10 MB) uploads go through server actions.
  // In Next.js 16 this still lives under experimental.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
