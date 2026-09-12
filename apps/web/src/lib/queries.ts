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
import type { Ad, Article, Category } from '@/payload-types'

export type AdSlotKey = (typeof AD_SLOTS)[number]

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
  const { docs } = await cmsFind<Article>('posts', {
    where: { featured: { equals: true } },
    sort: '-publishedAt',
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
}

export async function getLatestArticles(options: {
  categoryId?: number
  excludeId?: number
  limit?: number
} = {}): Promise<Article[]> {
  const { categoryId, excludeId, limit = 12 } = options

  const { docs } = await cmsFind<Article>('posts', {
    where: {
      ...(categoryId !== undefined && { category: { equals: categoryId } }),
      ...(excludeId !== undefined && { id: { not_equals: excludeId } }),
    },
    sort: '-publishedAt',
    limit,
    depth: 2,
  })
  return docs
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { docs } = await cmsFind<Article>('posts', {
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
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
