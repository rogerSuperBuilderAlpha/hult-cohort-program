import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Wallpaper uploads go through a server action; default limit is 1 MB.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
