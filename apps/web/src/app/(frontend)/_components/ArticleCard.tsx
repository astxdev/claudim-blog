import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/payload-types'
import { isPopulated } from '@/lib/relations'
import { resolveMediaUrl } from '@/lib/cms-client'
import { formatPublishedDate } from '@/lib/format'
import { estimateReadingTimeMinutes } from '@/lib/reading-time'
import { CategoryBadge } from './CategoryBadge'

interface ArticleCardProps {
  article: Article
  variant?: 'compact' | 'default' | 'feature' | 'secondary'
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const category = isPopulated(article.category) ? article.category : null
  const heroImageSource = isPopulated(article.heroImage) ? article.heroImage : null
  const heroImageUrl = resolveMediaUrl(heroImageSource?.url)
  const heroImage = heroImageSource && heroImageUrl ? { ...heroImageSource, url: heroImageUrl } : null
  const readingTime = estimateReadingTimeMinutes(article.body)
  const publishedDate = formatPublishedDate(article.publishedAt)
  const href = category ? `/${category.slug}/${article.slug}` : '#'
  const badge = category && (
    <CategoryBadge title={category.title} slug={category.slug} accentColor={category.accentColor} asLink={false} />
  )

  if (variant === 'compact') {
    return (
      <li className="border-border border-t py-3.5 first:border-t-0 first:pt-0">
        <Link href={href} className="group block">
          {badge}
          <h3 className="headline mt-1 text-base font-semibold leading-snug group-hover:underline">{article.title}</h3>
          {publishedDate && <p className="text-ink-muted mt-1 text-xs">{publishedDate}</p>}
        </Link>
      </li>
    )
  }

  // Manchete de capa, ao estilo de primeira página de jornal: foto acima,
  // texto abaixo em fluxo normal — sem overlay, sem gradiente por cima da imagem.
  if (variant === 'feature') {
    return (
      <article>
        <Link href={href} className="group block">
          {heroImage && (
            <Image
              src={heroImage.url}
              alt={heroImage.alt}
              width={heroImage.width ?? 1600}
              height={heroImage.height ?? 900}
              priority
              className="hero-carousel__image aspect-[4/3] w-full rounded-md object-cover sm:aspect-[16/10]"
            />
          )}
          <div className="mt-4">
            {badge}
            <h2 className="headline mt-1.5 text-2xl font-bold leading-[1.1] group-hover:underline sm:text-3xl lg:text-4xl">
              {article.title}
            </h2>
            {article.dek && <p className="text-ink-muted mt-3 text-base sm:text-lg">{article.dek}</p>}
            <p className="text-ink-muted mt-3 text-xs">
              {publishedDate ? `${publishedDate} · ` : ''}
              {readingTime} min de leitura
            </p>
          </div>
        </Link>
      </article>
    )
  }

  // Story secundária, compacta: texto à esquerda, thumbnail pequena à direita
  // — o mesmo padrão de "coluna do meio" de uma primeira página de jornal.
  if (variant === 'secondary') {
    return (
      <article className="border-border border-t py-4 first:border-t-0 first:pt-0">
        <Link href={href} className="group flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {badge}
            <h3 className="headline mt-1 text-base font-semibold leading-snug group-hover:underline sm:text-lg">
              {article.title}
            </h3>
            <p className="text-ink-muted mt-1.5 text-xs">
              {publishedDate ? `${publishedDate} · ` : ''}
              {readingTime} min de leitura
            </p>
          </div>
          {heroImage && (
            <Image
              src={heroImage.url}
              alt={heroImage.alt}
              width={96}
              height={96}
              className="aspect-square w-20 shrink-0 rounded-md object-cover sm:w-24"
            />
          )}
        </Link>
      </article>
    )
  }

  return (
    <article className="flex flex-col">
      <Link href={href} className="group flex flex-col gap-3 sm:flex-row sm:gap-5">
        {heroImage && (
          <div className="sm:w-2/5 sm:flex-shrink-0">
            <Image
              src={heroImage.url}
              alt={heroImage.alt}
              width={heroImage.width ?? 800}
              height={heroImage.height ?? 500}
              className="aspect-[16/10] w-full rounded-md object-cover"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-center">
          {badge}
          <h3 className="headline mt-1.5 text-xl font-semibold leading-snug group-hover:underline sm:text-2xl">
            {article.title}
          </h3>
          <p className="text-ink-muted mt-2 line-clamp-2 text-sm sm:text-base">{article.excerpt}</p>
          <p className="text-ink-muted mt-3 text-xs">
            {publishedDate ? `${publishedDate} · ` : ''}
            {readingTime} min de leitura
          </p>
        </div>
      </Link>
    </article>
  )
}
