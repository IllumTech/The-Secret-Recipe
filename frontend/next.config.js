/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable dynamic routes and SSR
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
}

module.exports = nextConfig
