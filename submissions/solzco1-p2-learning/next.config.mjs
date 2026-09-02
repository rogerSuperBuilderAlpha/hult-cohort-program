/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { workerThreads: false, cpus: 1 },
};

export default nextConfig;
