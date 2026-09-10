import { ArticleCard } from './_components/ArticleCard'
import { AdSlot } from './_components/AdSlot'
import { getActiveAd, getFeaturedArticle, getLatestArticles } from '@/lib/queries'


export default async function HomePage() {
  const featured = await getFeaturedArticle()
  const [latest, homeAd, sidebarAd] = await Promise.all([
    getLatestArticles({ excludeId: featured?.id, limit: 13 }),
    getActiveAd('homepage-after-hero'),
    getActiveAd('section-sidebar'),
  ])

  const secondary = latest.slice(0, 2)
  const brief = latest.slice(2, 5)
  const moreRiver = latest.slice(5, 9)

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Capa: manchete principal + coluna secundária + boletim, tamanhos diferentes lado a lado */}
      <div className="divide-border grid gap-8 lg:grid-cols-12 lg:gap-x-10 lg:divide-x">
        <div className="lg:col-span-5">{featured && <ArticleCard article={featured} variant="feature" />}</div>

        <div className="flex flex-col lg:col-span-4 lg:pl-10">
          {secondary.map((article) => (
            <ArticleCard key={article.id} article={article} variant="secondary" />
          ))}
        </div>

        <aside className="flex flex-col gap-6 lg:col-span-3 lg:pl-10">
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
    </div>
  )
}
