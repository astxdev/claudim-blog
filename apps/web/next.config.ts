import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// URL do Payload remoto (a VPS) de onde vêm as imagens de mídia quando este
// deploy roda só como frontend — em dev/self-host aponta pra si mesmo (http).
const cmsUrl = new URL(process.env.PAYLOAD_CMS_URL ?? 'https://cms.claudim.com')

const nextConfig: NextConfig = {
  transpilePackages: ['@claudim/core', '@claudim/infra'],
  images: {
    // '/api/media/file/**' cobre o caso deste app rodar como o próprio CMS
    // (self-host); remotePatterns cobre o caso normal (Vercel só frontend,
    // mídia servida pelo Payload remoto).
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/brand/**',
      },
    ],
    remotePatterns: [
      {
        protocol: cmsUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: cmsUrl.hostname,
        port: cmsUrl.port || undefined,
      },
    ],
    // Só em dev: PAYLOAD_CMS_URL aponta pro próprio localhost (o app roda o
    // CMS embutido), e o otimizador de imagem bloqueia hosts privados por
    // padrão (proteção contra SSRF). Em produção o CMS é um host público de
    // verdade (cms.claudim.com), então essa proteção continua ativa lá.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
  },
  turbopack: {
    // Monorepo: a raiz real é dois níveis acima (onde está o pnpm-lock.yaml),
    // não apps/web — senão o Turbopack não segue os symlinks do pnpm para
    // node_modules hoisted na raiz (ex: next em si) e falha ao resolver.
    root: path.resolve(dirname, '../..'),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
