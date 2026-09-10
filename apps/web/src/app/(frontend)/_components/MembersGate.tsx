import type { ReactNode } from 'react'
import { canRenderFullContent, type ArticleAccessLevel } from '@claudim/core'

interface MembersGateProps {
  accessLevel: ArticleAccessLevel
  excerpt: string
  children: ReactNode
}

/**
 * Decide, no servidor, se o corpo completo do artigo é enviado ao cliente.
 * Para `accessLevel: "members"` o HTML do corpo nunca chega ao navegador —
 * só o teaser + CTA de assinatura (ver `canRenderFullContent` em @claudim/core).
 */
export function MembersGate({ accessLevel, excerpt, children }: MembersGateProps) {
  if (canRenderFullContent(accessLevel)) {
    return <>{children}</>
  }

  return (
    <div>
      <p className="prose-article text-ink">{excerpt}</p>
      <div className="border-border from-surface relative mt-6 overflow-hidden rounded-2xl border bg-gradient-to-b to-transparent p-8 text-center">
        <span className="bg-members inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Conteúdo para assinantes
        </span>
        <h3 className="headline mt-3 text-xl font-semibold">Continue lendo com a newsletter Claudim</h3>
        <p className="text-ink-muted mt-2 text-sm">
          Assine gratuitamente com seu e-mail corporativo para acompanhar as análises completas de tecnologia, negócios, pessoas e processos.
        </p>
        <a
          href="#assinar-newsletter"
          className="bg-accent-strong mt-5 inline-block rounded-full px-6 py-2.5 text-sm font-semibold text-white"
        >
          Quero assinar
        </a>
      </div>
    </div>
  )
}
