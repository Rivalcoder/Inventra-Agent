/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Disable static optimization for API routes
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Environment variables are automatically loaded by Next.js
  // No need to explicitly define them here
};

module.exports = nextConfig;
