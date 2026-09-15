'use client'

import { useEffect, useState } from 'react'
import type { Article } from '@/payload-types'
import { ArticleCard } from './ArticleCard'

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
        {articles.map((article, index) => (
          <div
            key={article.id}
            aria-hidden={index !== activeIndex}
            className={`hero-carousel__slide ${index === activeIndex ? 'hero-carousel__slide--active' : ''}`}
          >
            <ArticleCard article={article} variant="feature" />
          </div>
        ))}
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
