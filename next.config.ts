import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // react-dom/server.node is used in the publish API route to render static HTML.
  // Without this, Next.js's RSC bundler replaces it with a stub that throws.
  serverExternalPackages: ['react-dom'],
  // Linting runs as a separate CI step (`npm run lint`) — not during build.
  // next build's internal lint check doesn't support ESLint 9 flat config yet,
  // producing a false "plugin not detected" warning. Disabling avoids the noise.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript errors still fail the build — this stays on.
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
