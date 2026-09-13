import { getCategories, getPublishedArticleRoutes } from '@/lib/queries'
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [categories, articles] = await Promise.all([getCategories(), getPublishedArticleRoutes(50)])
  const categoryLinks = categories
    .map((category) => `- [${category.title}](${absoluteUrl('/' + category.slug)})`)
    .join('\n')
  const articleLinks = articles
    .map((article) => `- [${article.title}](${absoluteUrl('/' + article.categorySlug + '/' + article.slug)})`)
    .join('\n')

  const content = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

O Claudim é um portal editorial brasileiro sobre tecnologia, negócios, pessoas e processos. O conteúdo é produzido para profissionais e líderes que buscam contexto, análise e informação prática para tomar decisões.

## Seções

${categoryLinks || `- [Página inicial](${absoluteUrl('/')})`}

## Conteúdo recente

${articleLinks || `- [Página inicial](${absoluteUrl('/')})`}

## Diretrizes de uso

Consulte as páginas originais para contexto completo, autoria, data de publicação e atualizações. Ao citar o conteúdo, preserve o link canônico e atribua a fonte ao Claudim.
`

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
