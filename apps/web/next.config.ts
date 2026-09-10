import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  transpilePackages: ['@claudim/core', '@claudim/infra'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/brand/**',
      },
    ],
  },
  turbopack: {
    // Monorepo: a raiz real é dois níveis acima (onde está o pnpm-lock.yaml),
    // não apps/web — senão o Turbopack não segue os symlinks do pnpm para
    // node_modules hoisted na raiz (ex: next em si) e falha ao resolver.
    root: path.resolve(dirname, '../..'),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
