/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.pollinations.ai' },
      { protocol: 'https', hostname: 'gen.pollinations.ai' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@resvg/resvg-js',
      'satori',
      '@four-meme/four-meme-ai',
      'tsx',
      'viem',
    ],
    // Surgical tracing: bundle the four.meme CLI + its full runtime dep tree.
    // The CLI spawns tsx as a child process, which dynamically imports viem,
    // ox, and their transitive crypto/utility deps. None of this is statically
    // traceable, so we force-include each package by name.
    outputFileTracingIncludes: {
      '/api/deploy': [
        // four.meme CLI itself
        './node_modules/@four-meme/**/*',
        // tsx runtime (+ esbuild, typescript config tools)
        './node_modules/tsx/**/*',
        './node_modules/esbuild/**/*',
        './node_modules/@esbuild/**/*',
        './node_modules/get-tsconfig/**/*',
        './node_modules/resolve-pkg-maps/**/*',
        // viem + transitive deps
        './node_modules/viem/**/*',
        './node_modules/abitype/**/*',
        './node_modules/@noble/**/*',
        './node_modules/@scure/**/*',
        './node_modules/ox/**/*',
        './node_modules/isows/**/*',
        './node_modules/ws/**/*',
        // ox deps
        './node_modules/@adraffy/**/*',
        './node_modules/eventemitter3/**/*',
        // four-meme-ai runtime
        './node_modules/dotenv/**/*',
      ],
    },
  },
}

module.exports = nextConfig
