import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArticleCard } from '../_components/ArticleCard'
import { AdSlot } from '../_components/AdSlot'
import { getActiveAd, getCategoryBySlug, getLatestArticles } from '@/lib/queries'
import { absoluteUrl } from '@/lib/site'

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)
  return {
    title: category?.title ?? 'Seção não encontrada',
    description: category?.description ?? undefined,
    alternates: { canonical: absoluteUrl(`/${slug}`) },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const [articles, sidebarAd] = await Promise.all([
    getLatestArticles({ categoryId: category.id, limit: 10 }),
    getActiveAd('section-sidebar'),
  ])

  const [pinned, ...rest] = articles

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="border-border border-b pb-6">
        <h1 className="headline text-3xl font-semibold text-ink sm:text-4xl">{category.title}</h1>
        {category.description && <p className="text-ink-muted mt-2 max-w-2xl">{category.description}</p>}
      </header>

      {pinned && (
        <div className="mt-8">
          <ArticleCard article={pinned} variant="feature" />
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-10 lg:col-span-2">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
          {rest.length === 0 && !pinned && (
            <p className="text-ink-muted">Ainda não há matérias publicadas nesta seção.</p>
          )}
        </div>
        <aside>
          <AdSlot ad={sidebarAd} />
        </aside>
      </div>
    </div>
  )
}
