import Link from 'next/link'

interface CategoryBadgeProps {
  title: string
  slug: string
  accentColor?: string | null
  /** false quando o badge já está dentro de outro `<a>` (ex: card de artigo) — HTML não permite `<a>` aninhado. */
  asLink?: boolean
}

/**
 * Rótulo de categoria (kicker) usado em cards e no topo de artigos.
 * Segue o padrão editorial clássico (Economist/NYT): texto em caixa alta,
 * tracking largo, na cor da categoria — é o que dá o "cheiro de portal"
 * em vez de blog.
 */
export function CategoryBadge({ title, slug, accentColor, asLink = true }: CategoryBadgeProps) {
  const className = 'kicker font-bold hover:underline'
  const style = { color: accentColor ?? 'var(--color-accent-strong)' }

  if (!asLink) {
    return (
      <span className={className} style={style}>
        {title}
      </span>
    )
  }

  return (
    <Link href={`/${slug}`} className={className} style={style}>
      {title}
    </Link>
  )
}
