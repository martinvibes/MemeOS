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
    // Force Vercel to include the four.meme CLI and its runtime deps in the Lambda bundle.
    // Without this, Next.js tree-shakes them out because they're only referenced via shell spawn.
    outputFileTracingIncludes: {
      '/api/deploy': [
        './node_modules/@four-meme/**/*',
        './node_modules/tsx/**/*',
        './node_modules/viem/**/*',
        './node_modules/dotenv/**/*',
      ],
    },
  },
}

module.exports = nextConfig
