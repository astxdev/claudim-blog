import Image from 'next/image'
import type { Ad } from '@/payload-types'
import { isPopulated } from '@/lib/relations'
import { resolveMediaUrl } from '@/lib/cms-client'

/**
 * Faixa no topo da página, acima do cabeçalho — o espaço reservado para
 * publicidade (padrão de portal de notícias). Enquanto não há um anúncio
 * ativo cadastrado no Payload, usa a imagem de capa da marca como um
 * "masthead" editorial, para o espaço não ficar vazio.
 */
export function TopBanner({ ad }: { ad: Ad | null }) {
  const adImage = ad && isPopulated(ad.image) ? ad.image : null
  const adImageUrl = resolveMediaUrl(adImage?.url)

  if (ad && adImage && adImageUrl) {
    return (
      <div className="bg-surface border-border border-b py-2 text-center">
        <p className="text-ink-muted mb-2 text-[0.65rem] uppercase tracking-widest">Publicidade</p>
        <a href={ad.url} target="_blank" rel="noopener noreferrer sponsored" className="mx-auto block max-w-4xl px-6">
          <Image
            src={adImageUrl}
            alt={adImage.alt}
            width={adImage.width ?? 1200}
            height={adImage.height ?? 150}
            className="mx-auto max-h-[120px] w-auto rounded-md object-contain"
          />
        </a>
      </div>
    )
  }

  return (
    <div className="relative h-24 w-full overflow-hidden sm:h-32">
      <Image
        src="/brand/hero-image.jpg"
        alt="Claudim — inteligência aplicada aos negócios"
        fill
        priority
        className="object-cover"
      />
    </div>
  )
}
