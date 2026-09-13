import React from 'react'
import { Inter, Source_Serif_4 } from 'next/font/google'
import type { Metadata } from 'next'
import './styles.css'
import { SiteHeader } from './_components/SiteHeader'
import { SiteFooter } from './_components/SiteFooter'
import { NewsletterBar } from './_components/NewsletterBar'
import { TopBanner } from './_components/TopBanner'
import { getActiveAd } from '@/lib/queries'
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
})

// Renderiza tudo sob demanda (não no build): o conteúdo vem de um Payload
// remoto (a VPS), que não precisa estar de pé no momento do build da Vercel.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: {
    default: 'Claudim — Inteligência aplicada aos negócios',
    template: '%s · Claudim',
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: './' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: SITE_NAME,
    title: 'Claudim — Inteligência aplicada aos negócios',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image', title: 'Claudim', description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const topBannerAd = await getActiveAd('top-banner')

  return (
    <html lang="pt-BR" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="pb-20">
        <TopBanner ad={topBannerAd} />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <NewsletterBar />
      </body>
    </html>
  )
}
