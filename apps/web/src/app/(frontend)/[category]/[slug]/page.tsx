import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { AuthorByline } from '../../_components/AuthorByline'
import { CategoryBadge } from '../../_components/CategoryBadge'
import { ShareBar } from '../../_components/ShareBar'
import { AdSlot } from '../../_components/AdSlot'
import { ArticleCard } from '../../_components/ArticleCard'
import { MembersGate } from '../../_components/MembersGate'
import { getActiveAd, getArticleBySlug } from '@/lib/queries'
import { isPopulated } from '@/lib/relations'
import { resolveMediaUrl } from '@/lib/cms-client'
import { formatPublishedDate } from '@/lib/format'
import { estimateReadingTimeMinutes } from '@/lib/reading-time'
import { absoluteUrl, SITE_NAME } from '@/lib/site'

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Matéria não encontrada' }
  const category = isPopulated(article.category) ? article.category : null
  const heroImage = isPopulated(article.heroImage) ? article.heroImage : null
  const canonical = absoluteUrl(`/${category?.slug ?? 'materia'}/${article.slug}`)
  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt,
      url: canonical,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: article.authors.filter(isPopulated).map((author) => author.name),
      images: heroImage?.url ? [{ url: resolveMediaUrl(heroImage.url) ?? heroImage.url, alt: heroImage.alt }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: article.title, description: article.seo?.description || article.excerpt },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const category = isPopulated(article.category) ? article.category : null
  const heroImageSource = isPopulated(article.heroImage) ? article.heroImage : null
  const heroImageUrl = resolveMediaUrl(heroImageSource?.url)
  const heroImage = heroImageSource && heroImageUrl ? { ...heroImageSource, url: heroImageUrl } : null
  const authors = article.authors.filter(isPopulated)
  const readingTime = estimateReadingTimeMinutes(article.body)
  const publishedDate = formatPublishedDate(article.publishedAt)
  const inlineAd = await getActiveAd('article-inline')
  const relatedPosts = article.relatedPosts ?? []

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.claudim.com'}/${category?.slug ?? ''}/${article.slug}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description: article.seo?.description || article.excerpt,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
            author: authors.map((author) => ({ '@type': 'Person', name: author.name })),
            publisher: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
            image: heroImage?.url,
          }),
        }}
      />
      <article className="mx-auto max-w-6xl px-6 py-8">
      <header className="mx-auto max-w-3xl text-center">
        {category && (
          <div className="flex justify-center">
            <CategoryBadge title={category.title} slug={category.slug} accentColor={category.accentColor} />
          </div>
        )}
        <h1 className="headline mt-3 text-3xl font-semibold text-ink sm:text-5xl">{article.title}</h1>
        {article.dek && <p className="text-ink-muted mt-4 text-lg sm:text-xl">{article.dek}</p>}
        <div className="mt-6 flex justify-center">
          <AuthorByline authors={authors} />
        </div>
        <p className="text-ink-muted mt-2 text-sm">
          {publishedDate ? `${publishedDate} · ` : ''}
          {readingTime} min de leitura
        </p>
      </header>

      <div className="mx-auto mt-4 max-w-3xl md:hidden">
        <ShareBar url={shareUrl} title={article.title} />
      </div>

      {heroImage && (
        <Image
          src={heroImage.url}
          alt={heroImage.alt}
          width={heroImage.width ?? 1600}
          height={heroImage.height ?? 900}
          priority
          className="mx-auto mt-8 aspect-[16/9] w-full max-w-4xl rounded-2xl object-cover"
        />
      )}

      <div className="mx-auto mt-10 grid max-w-4xl gap-10 md:grid-cols-[3rem_1fr] lg:max-w-none lg:grid-cols-[3rem_minmax(0,44rem)_16rem] lg:gap-12">
        <div className="hidden md:block">
          <div className="sticky top-28">
            <ShareBar url={shareUrl} title={article.title} orientation="vertical" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl lg:mx-0">
          <MembersGate accessLevel={article.accessLevel} excerpt={article.excerpt}>
            <div className="prose-article">
              <RichText data={article.body} />
            </div>
          </MembersGate>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <AdSlot ad={inlineAd} />
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-10 max-w-3xl lg:hidden">
        <AdSlot ad={inlineAd} />
      </div>

      {relatedPosts.length > 0 && (
        <section className="article-related-posts mx-auto mt-14 max-w-4xl border-t border-border pt-8">
          <p className="kicker text-ink-muted">Continue explorando</p>
          <h2 className="headline mt-1 text-2xl font-semibold text-ink">Posts relacionados</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <ArticleCard key={relatedPost.id} article={relatedPost} variant="secondary" />
            ))}
          </div>
        </section>
      )}
      </article>
    </>
  )
}
