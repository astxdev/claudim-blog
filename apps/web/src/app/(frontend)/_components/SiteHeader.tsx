import Image from 'next/image'
import Link from 'next/link'
import { getCategories } from '@/lib/queries'

export async function SiteHeader() {
  const categories = await getCategories()

  return (
    <header className="bg-bg/95 sticky top-0 z-30 backdrop-blur">
      <div className="bg-accent-strong h-1 w-full" aria-hidden />

      <div className="border-border mx-auto flex max-w-6xl items-center justify-between gap-6 border-b px-6 py-4">
        <Link href="/" className="shrink-0">
          <Image src="/brand/logo-verde-v2.svg" alt="Claudim" width={140} height={29} priority />
        </Link>

        <div className="flex items-center gap-3">
          <details className="site-search">
            <summary className="text-ink hover:text-accent-strong flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full" aria-label="Pesquisar">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </summary>
            <form action="/search" method="get" className="site-search__form">
              <label htmlFor="site-search-input" className="sr-only">Pesquisar artigos</label>
              <input id="site-search-input" name="q" type="search" placeholder="Pesquisar" autoComplete="off" />
              <button type="submit">Buscar</button>
            </form>
          </details>
          <a href="#assinar-newsletter" className="bg-ink shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-ink-inverse">Assine</a>
        </div>
      </div>

      <nav className="border-border mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto border-b px-6 py-2.5 sm:gap-7">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/${category.slug}`}
            className="text-ink hover:text-accent-strong shrink-0 text-sm font-semibold"
          >
            {category.title}
          </Link>
        ))}
      </nav>
    </header>
  )
}
