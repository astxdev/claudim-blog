import { ArticleCard } from './_components/ArticleCard'
import { HeroCarousel } from './_components/HeroCarousel'
import { AdSlot } from './_components/AdSlot'
import Link from 'next/link'
import { getActiveAd, getCategories, getFeaturedArticles, getLatestArticles } from '@/lib/queries'
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'

export const metadata = {
  alternates: { canonical: absoluteUrl('/') },
}


export default async function HomePage() {
  const [featuredSlides, categories, homeAd, sidebarAd] = await Promise.all([
    getFeaturedArticles(3),
    getCategories(),
    getActiveAd('homepage-after-hero'),
    getActiveAd('section-sidebar'),
  ])
  const latest = await getLatestArticles({ excludeIds: featuredSlides.map((article) => article.id), limit: 13 })
  const slides = featuredSlides.length > 0 ? featuredSlides : latest.slice(0, 3)
  const categorySections = await Promise.all(
    categories.map(async (category) => ({
      category,
      articles: await getLatestArticles({ categoryId: category.id, limit: 3 }),
    })),
  )

  const secondary = latest.slice(0, 2)
  const brief = latest.slice(2, 5)
  const moreRiver = latest.slice(5, 9)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              { '@type': 'Organization', '@id': `${absoluteUrl('/')}#organization`, name: SITE_NAME, url: absoluteUrl('/') },
              { '@type': 'WebSite', '@id': `${absoluteUrl('/')}#website`, name: SITE_NAME, description: SITE_DESCRIPTION, url: absoluteUrl('/') },
            ],
          }),
        }}
      />
      <div className="mx-auto max-w-6xl px-6 py-8">
      <HeroCarousel articles={slides} />

      {/* Capa: coluna secundária + boletim, abaixo do carrossel principal */}
      <div className="divide-border grid gap-8 lg:grid-cols-12 lg:gap-x-10 lg:divide-x">
        <div className="flex flex-col lg:col-span-8 lg:pl-0">
          {secondary.map((article) => (
            <ArticleCard key={article.id} article={article} variant="secondary" />
          ))}
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-4 lg:pl-10">
          <div className="border-border rounded-md border p-4">
            <h2 className="kicker text-ink-muted">Resumo do dia</h2>
            <ul className="mt-2">
              {brief.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </ul>
          </div>
          <AdSlot ad={homeAd} />
        </aside>
      </div>

      {/* Rio de matérias, tamanho único mas variado por conteúdo — continuação da primeira página */}
      <div className="border-border mt-12 border-t pt-10">
        <h2 className="headline text-xl font-semibold text-ink">Mais recentes</h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-3">
          <div className="flex flex-col gap-10 lg:col-span-2">
            {moreRiver.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <aside>
            <AdSlot ad={sidebarAd} />
          </aside>
        </div>
      </div>

      <div className="mt-14 border-t border-border pt-10">
        <h2 className="headline text-xl font-semibold text-ink">Por categoria</h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {categorySections.filter(({ articles }) => articles.length > 0).map(({ category, articles }) => (
            <section key={category.id} aria-labelledby={`category-${category.id}`}>
              <div className="flex items-baseline justify-between border-b border-border pb-2">
                <h3 id={`category-${category.id}`} className="headline text-2xl font-semibold text-ink">{category.title}</h3>
                <Link href={`/${category.slug}`} className="text-accent-strong text-sm font-semibold underline">Ver todas</Link>
              </div>
              <div className="mt-5 flex flex-col gap-6">
                {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
              </div>
            </section>
          ))}
        </div>
      </div>
      </div>
    </>
  )
}
