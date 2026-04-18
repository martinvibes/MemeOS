/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.pollinations.ai' },
      { protocol: 'https', hostname: 'gen.pollinations.ai' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@resvg/resvg-js', 'satori'],
  },
}

module.exports = nextConfig
