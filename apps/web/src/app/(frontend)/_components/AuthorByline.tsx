import Image from 'next/image'
import type { Author } from '@/payload-types'
import { isPopulated } from '@/lib/relations'

export function AuthorByline({ authors }: { authors: Author[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {authors.map((author) => {
        const avatar = isPopulated(author.avatar) ? author.avatar : null
        return (
          <div key={author.id} className="flex items-center gap-2.5">
            {avatar?.url ? (
              <Image
                src={avatar.url}
                alt={avatar.alt}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="bg-border h-9 w-9 rounded-full" aria-hidden />
            )}
            <div className="text-sm leading-tight">
              <p className="font-semibold text-ink">{author.name}</p>
              {author.role && <p className="text-ink-muted">{author.role}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
