'use client'

import { useState } from 'react'

interface ShareBarProps {
  url: string
  title: string
  orientation?: 'horizontal' | 'vertical'
}

const ICON_CLASS = 'h-4 w-4'

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.6 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2Zm-1.2 18h1.7L7.4 4h-1.8l12.1 16Z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2 3.77-2 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.7c0-1.36-.02-3.1-1.9-3.1-1.9 0-2.2 1.48-2.2 3v5.8h-4V9Z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.06-1.33A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.13l-.29-.17-3 .79.8-2.93-.19-.3A8 8 0 1 1 12 20Zm4.4-5.8c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.17-.7-.62-1.18-1.39-1.32-1.63-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.43-.58 1.63-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className={ICON_CLASS} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M10 14a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.5 1.5" strokeLinecap="round" />
      <path d="M14 10a5 5 0 0 0-7.07 0l-2 2a5 5 0 0 0 7.07 7.07l1.5-1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ShareBar({ url, title, orientation = 'horizontal' }: ShareBarProps) {
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = [
    { label: 'Compartilhar no X', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, icon: <XIcon /> },
    { label: 'Compartilhar no LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: <LinkedInIcon /> },
    { label: 'Compartilhar no WhatsApp', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, icon: <WhatsAppIcon /> },
  ]

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleNativeShare() {
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined)
    }
  }

  return (
    <div
      className={
        orientation === 'vertical'
          ? 'flex flex-col items-center gap-3'
          : 'flex items-center gap-3'
      }
    >
      <span className="kicker text-ink-muted hidden sm:inline">Compartilhar</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="border-border text-ink hover:bg-ink hover:text-ink-inverse flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
        >
          {link.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copiar link"
        className="border-border text-ink hover:bg-ink hover:text-ink-inverse flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
      >
        <LinkIcon />
      </button>
      {copied && <span className="text-ink-muted text-xs">Link copiado!</span>}
      <button
        type="button"
        onClick={handleNativeShare}
        className="text-accent-strong text-sm font-semibold underline sm:hidden"
      >
        Compartilhar
      </button>
    </div>
  )
}
