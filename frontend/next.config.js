/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
  output: 'standalone',
  outputFileTracingRoot: require('path').join(__dirname, '../'),
}

module.exports = nextConfig
