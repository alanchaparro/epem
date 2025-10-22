/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/auth/:path*', destination: 'http://localhost:4000/auth/:path*' },
      { source: '/users/:path*', destination: 'http://localhost:4000/users/:path*' },
      { source: '/patients/:path*', destination: 'http://localhost:4000/patients/:path*' },
    ];
  },
};

module.exports = nextConfig;
