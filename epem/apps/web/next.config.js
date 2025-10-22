/** @type {import('next').NextConfig} */
// Rewrites:
// - Todas las rutas `/api/*` se proxean al Gateway (4000) para evitar colisiones con páginas
// - Rutas específicas para /auth, /users y /patients
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/auth/:path*', destination: 'http://localhost:4000/auth/:path*' },
      { source: '/users/:path*', destination: 'http://localhost:4000/users/:path*' },
      { source: '/api/:path*', destination: 'http://localhost:4000/:path*' },
      { source: '/patients/:path*', destination: 'http://localhost:4000/patients/:path*' },
    ];
  },
};

module.exports = nextConfig;
