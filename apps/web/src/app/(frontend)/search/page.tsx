import type { Metadata } from 'next'
import { ArticleCard } from '../_components/ArticleCard'
import { searchArticles } from '@/lib/queries'
import { absoluteUrl } from '@/lib/site'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export const metadata: Metadata = {
  title: 'Pesquisa',
  alternates: { canonical: absoluteUrl('/search') },
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams
  const query = q.trim()
  const articles = query ? await searchArticles(query) : []

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="border-border border-b pb-6">
        <p className="kicker text-ink-muted">Pesquisa</p>
        <h1 className="headline mt-2 text-4xl font-semibold text-ink sm:text-5xl">
          {query ? `Resultados para “${query}”` : 'Encontre uma matéria'}
        </h1>
        <form action="/search" method="get" className="mt-6 flex max-w-2xl gap-3">
          <label htmlFor="search-page-input" className="sr-only">Pesquisar artigos</label>
          <input id="search-page-input" name="q" defaultValue={query} type="search" placeholder="Digite um assunto ou palavra-chave" className="border-border min-w-0 flex-1 rounded-full border px-4 py-3 text-sm" />
          <button type="submit" className="bg-ink rounded-full px-5 py-3 text-sm font-semibold text-ink-inverse">Pesquisar</button>
        </form>
      </header>

      {query && articles.length === 0 && <p className="text-ink-muted mt-10">Nenhuma matéria encontrada para essa busca.</p>}
      {articles.length > 0 && (
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
      )}
    </div>
  )
}
