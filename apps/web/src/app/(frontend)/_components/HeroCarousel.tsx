'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Article } from '@/payload-types'
import { isPopulated } from '@/lib/relations'
import { resolveMediaUrl } from '@/lib/cms-client'
import { CategoryBadge } from './CategoryBadge'

interface HeroCarouselProps {
  articles: Article[]
}

export function HeroCarousel({ articles }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (articles.length < 2 || isPaused) return
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % articles.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [articles.length, isPaused])

  if (articles.length === 0) return null

  function showSlide(targetIndex: number) {
    setActiveIndex((targetIndex + articles.length) % articles.length)
  }

  return (
    <section
      aria-label="Notícias em destaque"
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-carousel__slides">
        {articles.map((article, index) => {
          const imageSource = isPopulated(article.heroImage) ? article.heroImage : null
          const imageUrl = resolveMediaUrl(imageSource?.url)
          const category = isPopulated(article.category) ? article.category : null

          return (
            <div
              key={article.id}
              aria-hidden={index !== activeIndex}
              className={`hero-carousel__slide ${index === activeIndex ? 'hero-carousel__slide--active' : ''}`}
            >
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={imageSource?.alt ?? article.title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="hero-carousel__background object-cover"
                />
              )}
              <div className="hero-carousel__shade" aria-hidden="true" />
              <div className="hero-carousel__content">
                <div className="max-w-4xl">
                  {category && <CategoryBadge title={category.title} slug={category.slug} accentColor="#f2efe7" asLink={false} />}
                  <Link href={category ? `/${category.slug}/${article.slug}` : '#'} className="group block">
                    <h1 className="headline mt-3 text-3xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">{article.title}</h1>
                    {article.dek && <p className="mt-4 max-w-3xl text-base text-white/85 sm:text-xl">{article.dek}</p>}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {articles.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Notícia anterior"
            className="hero-carousel__arrow hero-carousel__arrow--prev"
            onClick={() => showSlide(activeIndex - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Próxima notícia"
            className="hero-carousel__arrow hero-carousel__arrow--next"
            onClick={() => showSlide(activeIndex + 1)}
          >
            →
          </button>
          <div className="hero-carousel__dots" aria-label="Selecionar notícia">
            {articles.map((article, index) => (
              <button
                key={article.id}
                type="button"
                aria-label={`Exibir notícia ${index + 1}`}
                aria-current={index === activeIndex}
                className={`hero-carousel__dot ${index === activeIndex ? 'hero-carousel__dot--active' : ''}`}
                onClick={() => showSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
