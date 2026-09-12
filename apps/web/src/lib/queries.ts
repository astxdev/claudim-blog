/**
 * @file queries.ts
 * @description Camada de leitura do CMS usada pelas páginas do frontend
 *
 * Responsabilidade: centralizar todas as consultas de conteúdo (artigos,
 * categorias, anúncios) num único lugar tipado, para as páginas não
 * conhecerem detalhes da API REST do Payload remoto.
 * Camada: web
 */
import { cmsFind } from './cms-client'
import type { AD_SLOTS } from '@/collections/Ads'
import type { Ad, Article, Author, Category, Media } from '@/payload-types'

export type AdSlotKey = (typeof AD_SLOTS)[number]

type RemotePost = {
  id: number
  title: string
  slug?: string | null
  heroImage?: number | Media | null
  content?: Article['body'] | null
  categories?: (number | Category)[] | null
  meta?: { title?: string | null; description?: string | null } | null
  publishedAt: string
  authors?: (number | RemoteUser)[] | null
  populatedAuthors?: RemoteUser[] | null
  updatedAt: string
  createdAt: string
}

type RemoteUser = {
  id: number
  name?: string | null
  email?: string | null
  role?: string | null
  avatar?: number | Media | null
  updatedAt?: string
  createdAt?: string
}

function extractExcerpt(content: Article['body'] | null | undefined): string {
  if (!content) return ''

  const texts: string[] = []
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return
    const value = node as Record<string, unknown>
    if (typeof value.text === 'string') texts.push(value.text)
    if (Array.isArray(value.children)) value.children.forEach(visit)
  }
  visit(content.root)
  return texts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 180)
}

async function populatePostAuthors(post: RemotePost): Promise<Article['authors']> {
  const authorIds = (post.authors ?? []).map((author) => (typeof author === 'number' ? author : author.id))
  const fallback = (post.populatedAuthors?.length ? post.populatedAuthors : post.authors ?? []) as Article['authors']
  if (authorIds.length === 0) return fallback

  try {
    const { docs } = await cmsFind<RemoteUser>('users', {
      where: { id: { in: authorIds.join(',') } },
      limit: authorIds.length,
      depth: 2,
    })

    if (docs.length === 0) return fallback

    return docs.map((user) => ({
      id: user.id,
      name: user.name ?? user.email ?? 'Autor',
      role: user.role ?? null,
      avatar: user.avatar ?? null,
      updatedAt: user.updatedAt ?? new Date(0).toISOString(),
      createdAt: user.createdAt ?? new Date(0).toISOString(),
    }))
  } catch {
    // Avatar é enriquecimento. Se a collection de autores estiver indisponível,
    // o post continua renderizando com os autores já retornados pelo Payload.
    return fallback
  }
}

async function normalizePost(post: RemotePost): Promise<Article> {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: extractExcerpt(post.content),
    heroImage: post.heroImage as Article['heroImage'],
    category: (post.categories?.[0] ?? null) as Article['category'],
    authors: await populatePostAuthors(post),
    body: post.content as Article['body'],
    accessLevel: 'public',
    publishedAt: post.publishedAt,
    seo: {
      title: post.meta?.title,
      description: post.meta?.description,
    },
    updatedAt: post.updatedAt,
    createdAt: post.createdAt,
  }
}

export async function getCategories(): Promise<Category[]> {
  const { docs } = await cmsFind<Category>('categories', { limit: 4, sort: 'title' })
  return docs
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { docs } = await cmsFind<Category>('categories', {
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const { docs } = await cmsFind<RemotePost>('posts', {
    sort: '-publishedAt',
    limit: 1,
    depth: 2,
  })
  return docs[0] ? normalizePost(docs[0]) : null
}

export async function getLatestArticles(options: {
  categoryId?: number
  excludeId?: number
  limit?: number
} = {}): Promise<Article[]> {
  const { categoryId, excludeId, limit = 12 } = options

  const { docs } = await cmsFind<RemotePost>('posts', {
    where: {
      // `categories` é um relacionamento hasMany no Payload remoto. Para
      // filtrar por um ID relacionado, a API REST usa `equals`.
      ...(categoryId !== undefined && { categories: { equals: categoryId } }),
      ...(excludeId !== undefined && { id: { not_equals: excludeId } }),
    },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })
  return Promise.all(docs.map(normalizePost))
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { docs } = await cmsFind<RemotePost>('posts', {
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ? normalizePost(docs[0]) : null
}

export async function getActiveAd(slot: AdSlotKey): Promise<Ad | null> {
  try {
    const { docs } = await cmsFind<Ad>('ads', {
      where: {
        slot: { equals: slot },
        active: { equals: true },
      },
      limit: 1,
      depth: 1,
    })
    return docs[0] ?? null
  } catch {
    // Publicidade é opcional. A ausência ou indisponibilidade temporária da
    // collection não pode impedir o restante do site de renderizar.
    return null
  }
}
