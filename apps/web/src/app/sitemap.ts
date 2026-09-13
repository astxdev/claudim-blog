import type { MetadataRoute } from 'next'
import { getCategories, getPublishedArticleRoutes } from '@/lib/queries'
import { absoluteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles] = await Promise.all([getCategories(), getPublishedArticleRoutes()])

  return [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    ...categories.map((category) => ({
      url: absoluteUrl(`/${category.slug}`),
      lastModified: category.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/${article.categorySlug}/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
