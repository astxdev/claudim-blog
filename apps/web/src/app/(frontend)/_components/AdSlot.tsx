import Image from 'next/image'
import type { Ad } from '@/payload-types'
import { isPopulated } from '@/lib/relations'
import { resolveMediaUrl } from '@/lib/cms-client'

export function AdSlot({ ad }: { ad: Ad | null }) {
  if (!ad) return null

  const image = isPopulated(ad.image) ? ad.image : null
  const imageUrl = resolveMediaUrl(image?.url)
  if (!image || !imageUrl) return null

  return (
    <div className="border-border bg-surface mx-auto w-full max-w-sm rounded-xl border p-3">
      <p className="text-ink-muted mb-2 text-[0.65rem] uppercase tracking-widest">Publicidade</p>
      <a href={ad.url} target="_blank" rel="noopener noreferrer sponsored" className="block">
        <Image
          src={imageUrl}
          alt={image.alt}
          width={image.width ?? 600}
          height={image.height ?? 400}
          className="aspect-[21/9] w-full rounded-lg object-cover"
        />
      </a>
    </div>
  )
}
