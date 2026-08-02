import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/u/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/builders', destination: '/work', permanent: false },
      { source: '/partners/solutions', destination: '/partners', permanent: false },
    ];
  },
};

export default nextConfig;
