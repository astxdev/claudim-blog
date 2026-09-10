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
          <Image src="/brand/logo-verde.svg" alt="Claudim" width={140} height={29} priority />
        </Link>

        <a
          href="#assinar-newsletter"
          className="bg-ink shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-ink-inverse"
        >
          Assine
        </a>
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
