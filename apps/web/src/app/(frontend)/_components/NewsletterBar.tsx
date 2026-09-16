'use client'

import { useEffect, useState } from 'react'
import { NewsletterForm } from './NewsletterForm'

/**
 * Barra fixa de assinatura da newsletter. Sempre visível (não é um banner
 * dispensável): no desktop mostra o formulário inline; no mobile mostra uma
 * barra fina que abre uma folha em tela cheia com o formulário completo.
 */
export function NewsletterBar() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    setIsDismissed(window.localStorage.getItem('claudim-newsletter-dismissed') === 'true')

    function handleScroll() {
      if (window.scrollY > 120) setIsVisible(true)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function dismissNewsletter() {
    setIsDismissed(true)
    window.localStorage.setItem('claudim-newsletter-dismissed', 'true')
  }

  return (
    <div
      id="assinar-newsletter"
      aria-hidden={!isVisible}
      className={`newsletter-bar bg-ink fixed inset-x-0 bottom-0 z-40 shadow-[0_-8px_30px_rgb(0_0_0_/_0.12)] ${isVisible && !isDismissed ? 'newsletter-bar--visible' : ''}`}
    >
      <button
        type="button"
        onClick={dismissNewsletter}
        aria-label="Esconder newsletter"
        className="newsletter-bar__close text-ink-inverse/70 hover:text-ink-inverse"
      >
        ×
      </button>
      <div className="mx-auto hidden max-w-6xl items-center justify-between gap-4 px-6 py-3 md:flex">
        <div>
          <p className="text-sm font-semibold text-ink-inverse">Newsletter Claudim</p>
          <p className="text-xs text-ink-inverse/70">Conteúdo exclusivo para assinantes, direto no seu e-mail corporativo.</p>
        </div>
        <NewsletterForm compact idPrefix="desktop" />
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 md:hidden">
        <p className="text-sm font-medium text-ink-inverse">Assine a newsletter Claudim</p>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="bg-accent-strong hover:bg-accent shrink-0 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg ring-2 ring-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          Assinar
        </button>
      </div>

      {sheetOpen && (
        <div className="bg-bg fixed inset-0 z-50 flex flex-col overflow-y-auto p-6 md:hidden">
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            aria-label="Fechar"
            className="border-border text-ink ml-auto flex h-9 w-9 items-center justify-center rounded-full border"
          >
            ✕
          </button>
          <div className="mx-auto mt-6 w-full max-w-sm">
            <p className="headline text-2xl font-semibold text-ink">Assine a newsletter Claudim</p>
            <p className="text-ink-muted mt-2 text-sm">
              Análises completas de tecnologia, negócios, pessoas e processos — só com e-mail corporativo.
            </p>
            <div className="mt-6">
              <NewsletterForm idPrefix="mobile" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
