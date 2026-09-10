/**
 * @file queries.ts
 * @description Camada de leitura do Payload usada pelas páginas do frontend
 *
 * Responsabilidade: centralizar todas as consultas de conteúdo (artigos,
 * categorias, anúncios) num único lugar tipado, para as páginas não
 * conhecerem detalhes do Payload Local API.
 * Camada: web
 */
import type { Where } from 'payload'
import { getPayloadClient } from './get-payload-client'
import type { AD_SLOTS } from '@/collections/Ads'
import type { Article, Category } from '@/payload-types'

export type AdSlotKey = (typeof AD_SLOTS)[number]

export async function getCategories(): Promise<Category[]> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    limit: 4,
    sort: 'title',
  })
  return result.docs
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return result.docs[0] ?? null
}

export async function getFeaturedArticle(): Promise<Article | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
    where: { featured: { equals: true } },
    sort: '-publishedAt',
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

export async function getLatestArticles(options: {
  categoryId?: number
  excludeId?: number
  limit?: number
} = {}): Promise<Article[]> {
  const { categoryId, excludeId, limit = 12 } = options
  const payload = await getPayloadClient()

  const where: Where = {
    ...(categoryId !== undefined && { category: { equals: categoryId } }),
    ...(excludeId !== undefined && { id: { not_equals: excludeId } }),
  }

  const result = await payload.find({
    collection: 'articles',
    where,
    sort: '-publishedAt',
    limit,
    depth: 2,
  })
  return result.docs
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return result.docs[0] ?? null
}

export async function getActiveAd(slot: AdSlotKey) {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'ads',
    where: {
      slot: { equals: slot },
      active: { equals: true },
    },
    limit: 1,
    depth: 1,
  })
  return result.docs[0] ?? null
}
