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
      articles: await getLatestArticles({ categoryId: category.id, limit: 5 }),
    })),
  )

  const secondary = latest.slice(0, 3)
  const brief = latest.slice(3, 6)
  const moreRiver = latest.slice(6, 10)

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
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="kicker text-ink-muted">Navegue por assunto</p>
            <h2 className="headline mt-1 text-2xl font-semibold text-ink sm:text-3xl">Editorias Claudim</h2>
          </div>
          <span className="text-ink-muted hidden text-sm sm:block">Análises para decisões melhores</span>
        </div>

        <div className="mt-8 flex flex-col gap-10">
          {categorySections.filter(({ articles }) => articles.length > 0).map(({ category, articles }, sectionIndex) => {
            const [lead, ...secondaryArticles] = articles
            const isTinted = sectionIndex % 2 === 0

            return (
              <section
                key={category.id}
                aria-labelledby={`category-${category.id}`}
                className={`homepage-editorial-section ${isTinted ? 'homepage-editorial-section--tinted' : ''}`}
              >
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                  <h3 id={`category-${category.id}`} className="headline text-2xl font-semibold text-ink sm:text-3xl">{category.title}</h3>
                  <Link href={`/${category.slug}`} className="text-accent-strong shrink-0 text-sm font-semibold underline">Ver todas</Link>
                </div>

                <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-10">
                  <div className="lg:col-span-7">
                    <ArticleCard article={lead} variant="feature" />
                  </div>
                  <div className="grid content-start gap-0 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                    {secondaryArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} variant="secondary" />
                    ))}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </div>
      </div>
    </>
  )
}
