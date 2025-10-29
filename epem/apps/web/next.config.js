/** @type {import('next').NextConfig} */
// Rewrites:
// - Todas las rutas `/api/*` se proxean al Gateway (4000) para evitar colisiones con páginas
// - Rutas específicas para /auth, /users y /patients
const gatewayUrl = process.env.API_GATEWAY_URL ?? 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  // Reduce noisy webpack persistent cache warnings on Windows/PNPM by using in-memory cache in dev
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
      config.infrastructureLogging = { level: 'error' };
    }
    return config;
  },
  async rewrites() {
    return [
      { source: '/auth/:path*', destination: `${gatewayUrl}/auth/:path*` },
      { source: '/users/:path*', destination: `${gatewayUrl}/users/:path*` },
      { source: '/roles/:path*', destination: `${gatewayUrl}/roles/:path*` },
      { source: '/patients/:path*', destination: `${gatewayUrl}/patients/:path*` },
      { source: '/orders/:path*', destination: `${gatewayUrl}/orders/:path*` },
      { source: '/billing/:path*', destination: `${gatewayUrl}/billing/:path*` },
      { source: '/catalog/:path*', destination: `${gatewayUrl}/catalog/:path*` },
      { source: '/api/:path*', destination: `${gatewayUrl}/:path*` },
    ];
  },
};

module.exports = nextConfig;
