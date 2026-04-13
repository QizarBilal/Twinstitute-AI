/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  rewrites: async () => ({
    beforeFiles: [
      {
        source: '/home',
        destination: '/dashboard',
      },
    ],
  }),
}

module.exports = nextConfig


