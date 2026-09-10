import Image from 'next/image'
import Link from 'next/link'
import { getCategories } from '@/lib/queries'

export async function SiteFooter() {
  const categories = await getCategories()

  return (
    <footer className="bg-ink mt-16 pb-24 pt-12 text-ink-inverse md:pb-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Image src="/brand/logo-branco.svg" alt="Claudim" width={140} height={29} />
          <p className="mt-4 max-w-xs text-sm text-ink-inverse/70">
            Inteligência aplicada aos negócios — tecnologia, negócios, pessoas e processos para quem decide.
          </p>
        </div>

        <div>
          <p className="kicker text-ink-inverse/60">Seções</p>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/${category.slug}`} className="hover:underline">
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="kicker text-ink-inverse/60">Claudim</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="#assinar-newsletter" className="hover:underline">
                Assine a newsletter
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl px-6 text-xs text-ink-inverse/50">
        © {new Date().getFullYear()} Claudim. Todos os direitos reservados.
      </p>
    </footer>
  )
}
