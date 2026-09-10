import React from 'react'
import { Inter, Source_Serif_4 } from 'next/font/google'
import type { Metadata } from 'next'
import './styles.css'
import { SiteHeader } from './_components/SiteHeader'
import { SiteFooter } from './_components/SiteFooter'
import { NewsletterBar } from './_components/NewsletterBar'
import { TopBanner } from './_components/TopBanner'
import { getActiveAd } from '@/lib/queries'

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

export const metadata: Metadata = {
  title: {
    default: 'Claudim — Inteligência aplicada aos negócios',
    template: '%s · Claudim',
  },
  description:
    'Notícias e análises sobre tecnologia, negócios, pessoas e processos para quem decide.',
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
