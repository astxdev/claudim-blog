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
  authors?: (number | Author)[] | null
  populatedAuthors?: Author[] | null
  updatedAt: string
  createdAt: string
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

function normalizePost(post: RemotePost): Article {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: extractExcerpt(post.content),
    heroImage: post.heroImage as Article['heroImage'],
    category: (post.categories?.[0] ?? null) as Article['category'],
    authors: (post.populatedAuthors?.length ? post.populatedAuthors : post.authors ?? []) as Article['authors'],
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
      ...(categoryId !== undefined && { categories: { contains: categoryId } }),
      ...(excludeId !== undefined && { id: { not_equals: excludeId } }),
    },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })
  return docs.map(normalizePost)
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
  const { docs } = await cmsFind<Ad>('ads', {
    where: {
      slot: { equals: slot },
      active: { equals: true },
    },
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}
