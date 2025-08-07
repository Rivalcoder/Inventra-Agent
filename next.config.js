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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve server-side modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        timers: false,
        'timers/promises': false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        url: false,
        querystring: false,
        path: false,
        os: false,
        assert: false,
        constants: false,
        events: false,
        http: false,
        https: false,
        zlib: false,
      };
    }
    return config;
  },
  // Environment variables are automatically loaded by Next.js
  // No need to explicitly define them here
};

module.exports = nextConfig;
