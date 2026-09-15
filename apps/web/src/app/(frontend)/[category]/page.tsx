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
    getLatestArticles({ categoryId: category.id, limit: 12 }),
    getActiveAd('section-sidebar'),
  ])

  const [pinned, ...rest] = articles
  const secondary = rest.slice(0, 2)
  const latest = rest.slice(2, 7)
  const more = rest.slice(7)

  return (
    <div className="category-page mx-auto max-w-6xl px-6 py-8">
      <header className="category-page__header border-border border-b border-t-4 pb-7 pt-5" style={{ borderTopColor: category.accentColor ?? 'var(--color-accent-strong)' }}>
        <p className="kicker" style={{ color: category.accentColor ?? 'var(--color-accent-strong)' }}>Editoria Claudim</p>
        <h1 className="headline mt-2 text-4xl font-semibold text-ink sm:text-5xl">{category.title}</h1>
        {category.description && <p className="text-ink-muted mt-3 max-w-2xl text-base sm:text-lg">{category.description}</p>}
      </header>

      {pinned && (
        <section className="category-page__section mt-10" aria-labelledby="category-featured-title">
          <div className="mb-5 flex items-center justify-between border-b border-border pb-3">
            <h2 id="category-featured-title" className="headline text-2xl font-semibold text-ink">Em destaque</h2>
            <span className="text-ink-muted text-sm">Leitura recomendada</span>
          </div>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7"><ArticleCard article={pinned} variant="feature" /></div>
            <div className="flex flex-col lg:col-span-5">
              {secondary.map((article) => <ArticleCard key={article.id} article={article} variant="secondary" />)}
            </div>
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="category-page__section category-page__section--tinted mt-12" aria-labelledby="category-latest-title">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <h2 id="category-latest-title" className="headline text-2xl font-semibold text-ink">Últimas notícias</h2>
            <span className="text-ink-muted text-sm">Atualizado recentemente</span>
          </div>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="flex flex-col gap-8 lg:col-span-8">
              {latest.map((article) => <ArticleCard key={article.id} article={article} />)}
            </div>
            <aside className="flex flex-col gap-8 lg:col-span-4">
              <AdSlot ad={sidebarAd} />
              {rest.length > 2 && (
                <div className="border-border rounded-md border bg-white p-5">
                  <p className="kicker text-ink-muted">Em resumo</p>
                  <ul className="mt-2">
                    {rest.slice(0, 3).map((article) => <ArticleCard key={article.id} article={article} variant="compact" />)}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </section>
      )}

      {more.length > 0 && (
        <section className="category-page__section mt-12" aria-labelledby="category-more-title">
          <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
            <h2 id="category-more-title" className="headline text-2xl font-semibold text-ink">Mais destaques</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {more.map((article) => <ArticleCard key={article.id} article={article} variant="secondary" />)}
          </div>
        </section>
      )}

      {!pinned && articles.length === 0 && (
        <div className="mt-10">
          <p className="text-ink-muted">Ainda não há matérias publicadas nesta seção.</p>
        </div>
      )}
    </div>
  )
}
