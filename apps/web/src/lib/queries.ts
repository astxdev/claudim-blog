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
  publishedAt?: string | null
  authors?: (number | RemoteUser)[] | null
  populatedAuthors?: RemoteUser[] | null
  relatedPosts?: (number | RemotePost)[] | null
  featured?: boolean | null
  featuredOrder?: number | null
  updatedAt?: string | null
  createdAt?: string | null
}

export type ArticleWithRelated = Article & {
  relatedPosts?: Article[]
}

export type PublishedArticleRoute = {
  title: string
  slug: string
  categorySlug: string
  updatedAt: string
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

function isValidDate(value: null | string | undefined): value is string {
  return Boolean(value && !Number.isNaN(new Date(value).getTime()))
}

function fallbackDate(...values: (null | string | undefined)[]): string {
  return values.find(isValidDate) ?? new Date(0).toISOString()
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

async function normalizePost(post: RemotePost, options: { includeRelated?: boolean } = {}): Promise<ArticleWithRelated> {
  const article: ArticleWithRelated = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: extractExcerpt(post.content),
    heroImage: post.heroImage as Article['heroImage'],
    category: (post.categories?.[0] ?? null) as Article['category'],
    authors: await populatePostAuthors(post),
    body: post.content as Article['body'],
    accessLevel: 'public',
    publishedAt: fallbackDate(post.publishedAt, post.createdAt),
    seo: {
      title: post.meta?.title,
      description: post.meta?.description,
    },
    updatedAt: fallbackDate(post.updatedAt, post.createdAt, post.publishedAt),
    createdAt: fallbackDate(post.createdAt, post.publishedAt, post.updatedAt),
  }

  if (options.includeRelated && post.relatedPosts?.length) {
    const populatedRelatedPosts = post.relatedPosts.filter(
      (relatedPost): relatedPost is RemotePost => typeof relatedPost === 'object' && relatedPost !== null,
    )

    article.relatedPosts = await Promise.all(
      populatedRelatedPosts
        .filter((relatedPost) => relatedPost.slug && relatedPost.id !== post.id && isValidDate(relatedPost.publishedAt))
        .slice(0, 3)
        .map((relatedPost) => normalizePost(relatedPost)),
    )
  }

  return article
}

export async function getCategories(): Promise<Category[]> {
  const { docs } = await cmsFind<Category>('categories', { limit: 100, sort: 'title' })
  return docs
}

export async function getPublishedArticleRoutes(limit = 1000): Promise<PublishedArticleRoute[]> {
  const { docs } = await cmsFind<RemotePost>('posts', {
    where: { publishedAt: { exists: true } },
    limit,
    sort: '-publishedAt',
    depth: 1,
  })

  return docs.flatMap((post) => {
    const slug = post.slug
    const category = post.categories?.[0]
    const categorySlug = typeof category === 'object' && category !== null ? category.slug : undefined
    if (!slug || !categorySlug) return []
    return [{ title: post.title, slug, categorySlug, updatedAt: fallbackDate(post.updatedAt, post.publishedAt, post.createdAt) }]
  })
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { docs } = await cmsFind<Category>('categories', {
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getFeaturedArticles(limit = 3): Promise<Article[]> {
  try {
    const { docs } = await cmsFind<RemotePost>('posts', {
      where: { featured: { equals: true } },
      sort: 'featuredOrder',
      limit,
      depth: 2,
    })
    return Promise.all(docs.map((post) => normalizePost(post)))
  } catch {
    // O CMS remoto pode ainda não ter recebido os campos do carrossel.
    // Nesse caso, a home usa o fallback de notícias recentes.
    return []
  }
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const articles = await getFeaturedArticles(1)
  return articles[0] ?? null
}

export async function getLatestArticles(options: {
  categoryId?: number
  excludeId?: number
  excludeIds?: number[]
  limit?: number
} = {}): Promise<Article[]> {
  const { categoryId, excludeId, excludeIds = [], limit = 12 } = options
  const excludedIds = [...excludeIds, ...(excludeId !== undefined ? [excludeId] : [])]

  const { docs } = await cmsFind<RemotePost>('posts', {
    where: {
      // `categories` é um relacionamento hasMany no Payload remoto. Para
      // filtrar por um ID relacionado, a API REST usa `equals`.
      ...(categoryId !== undefined && { categories: { equals: categoryId } }),
      ...(excludedIds.length > 0 && { id: { not_in: excludedIds.join(',') } }),
    },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })
  return Promise.all(docs.map((post) => normalizePost(post)))
}

export async function searchArticles(query: string, limit = 30): Promise<Article[]> {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) return []

  const { docs } = await cmsFind<RemotePost>('posts', {
    where: {
      or: [
        { title: { like: normalizedQuery } },
        { 'meta.title': { like: normalizedQuery } },
      ],
    },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })
  return Promise.all(docs.map((post) => normalizePost(post)))
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithRelated | null> {
  const { docs } = await cmsFind<RemotePost>('posts', {
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 3,
  })
  return docs[0] ? normalizePost(docs[0], { includeRelated: true }) : null
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
