'use client'

const SENDPULSE_FORM_ID = 'f7c5369ed22df36b41a42db13fd30327ca717c1a7ccb7b626f966c0cbc2343ed'

interface NewsletterFormProps {
  compact?: boolean
  idPrefix: string
}

export function NewsletterForm({ compact = false }: NewsletterFormProps) {
  return (
    <div className={compact ? 'min-w-0' : 'w-full'}>
      <script
        src="//web.webformscr.com/apps/fc3/build/loader.js"
        async
        sp-form-id={SENDPULSE_FORM_ID}
      />
    </div>
  )
}
