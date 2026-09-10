/**
 * @file index.ts
 * @description Script de seed — popula categorias, autores, mídia e artigos de exemplo
 *
 * Responsabilidade: dar conteúdo mínimo pro portal não ficar vazio em
 * desenvolvimento. Idempotente: pode rodar de novo sem duplicar registros.
 * Camada: web (script de desenvolvimento, não roda em produção)
 *
 * @example
 * pnpm --filter @claudim/web seed
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import { slugify } from '@claudim/core'
import config from '../payload.config.js'
import { buildRichText } from './lexical.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS_DIR = path.join(dirname, 'assets')

const CATEGORY_SEEDS = [
  { key: 'tech', title: 'Tecnologia', slug: 'tecnologia', accentColor: '#004039', description: 'IA, produto e engenharia aplicados a resultado de negócio.' },
  { key: 'business', title: 'Negócios', slug: 'negocios', accentColor: '#A6580D', description: 'Estratégia, mercado e movimentos que reconfiguram setores inteiros.' },
  { key: 'people', title: 'Pessoas', slug: 'pessoas', accentColor: '#6A3F9E', description: 'Liderança, cultura e o lado humano da transformação.' },
  { key: 'processes', title: 'Processos', slug: 'processos', accentColor: '#304A47', description: 'Operação, automação e a engenharia por trás da execução.' },
] as const

const AUTHOR_SEEDS = [
  { name: 'Ana Salgado', role: 'Editora de Tecnologia', bio: 'Cobre IA aplicada e produto há 10 anos.', avatarFile: 'author-1.jpg' },
  { name: 'Marcos Cunha', role: 'Editor de Negócios', bio: 'Ex-analista de mercado, escreve sobre estratégia e M&A.', avatarFile: 'author-2.jpg' },
  { name: 'Renata Lima', role: 'Editora de Pessoas', bio: 'Pesquisa liderança e cultura organizacional.', avatarFile: 'author-3.jpg' },
] as const

type CategoryKey = (typeof CATEGORY_SEEDS)[number]['key']

const ARTICLE_SEEDS: Array<{
  title: string
  dek: string
  excerpt: string
  category: CategoryKey
  authorIndex: number
  accessLevel: 'members' | 'public'
  featured?: boolean
  heroFile: string
  daysAgo: number
  body: string[]
}> = [
  {
    title: 'IA generativa sai do piloto e vira linha de produção',
    dek: 'Empresas que tratam IA como projeto de TI, e não como mudança de processo, estão ficando para trás.',
    excerpt: 'Um levantamento com 40 empresas brasileiras mostra o que separa quem só testou IA generativa de quem já colhe resultado recorrente.',
    category: 'tech',
    authorIndex: 0,
    accessLevel: 'public',
    featured: true,
    heroFile: 'tech-1.jpg',
    daysAgo: 0,
    body: [
      'Depois de dois anos de experimentação, o discurso mudou: o que era prova de conceito agora precisa aparecer no resultado trimestral.',
      'As empresas que avançaram têm um ponto em comum — trataram a adoção de IA como redesenho de processo, com dono de negócio no centro da decisão, e não como mais um projeto de tecnologia entregue e esquecido.',
      'O maior gargalo não é o modelo de linguagem escolhido, mas a qualidade dos dados internos e a clareza sobre qual decisão, exatamente, a IA deveria apoiar.',
      'Para times de liderança, a recomendação prática é simples: escolher um processo de alto volume e baixo risco, medir o antes e o depois, e só então escalar.',
    ],
  },
  {
    title: 'O custo escondido de manter sistemas legados vivos',
    dek: 'Modernizar dói, mas remendar dói mais — e por mais tempo.',
    excerpt: 'Análise de times de engenharia que compararam o custo real de manter versus migrar sistemas centrais.',
    category: 'tech',
    authorIndex: 0,
    accessLevel: 'members',
    heroFile: 'tech-2.jpg',
    daysAgo: 1,
    body: [
      'Manter um sistema legado parece, no orçamento anual, mais barato do que migrar. O problema aparece dois ou três anos depois, espalhado em incidentes e retrabalho.',
      'Times que documentaram o custo real de manutenção encontraram um padrão: cada nova integração levava mais tempo que a anterior, um sinal claro de dívida técnica composta.',
      'A decisão de migrar deixou de ser técnica e virou financeira assim que alguém colocou os dois caminhos lado a lado, com o mesmo horizonte de tempo.',
    ],
  },
  {
    title: 'Como equipes pequenas de dados entregam mais que times grandes',
    dek: 'O gargalo raramente é headcount — é prioridade mal definida.',
    excerpt: 'Times enxutos de dados vêm entregando mais valor que estruturas grandes e departamentalizadas.',
    category: 'tech',
    authorIndex: 0,
    accessLevel: 'public',
    heroFile: 'tech-3.jpg',
    daysAgo: 3,
    body: [
      'Um time de quatro pessoas com acesso direto à liderança resolveu, em um trimestre, o que uma estrutura de vinte pessoas não tinha resolvido em um ano.',
      'A diferença não estava na técnica, e sim na distância entre quem decide a prioridade e quem executa — quanto menor essa distância, mais rápido o ciclo de aprendizado.',
    ],
  },
  {
    title: 'Fusões que dão certo têm uma coisa em comum: integração lenta de propósito',
    dek: 'Pressa em unificar sistemas e times é a principal causa de valor destruído em M&A.',
    excerpt: 'Estudo de casos de fusões bem-sucedidas mostra que a velocidade de integração não é o que garante o resultado.',
    category: 'business',
    authorIndex: 1,
    accessLevel: 'members',
    heroFile: 'business-1.jpg',
    daysAgo: 2,
    body: [
      'A pressão do mercado por sinergia rápida empurra empresas recém-fundidas a unificar sistemas antes de entender a cultura operacional de cada lado.',
      'Nos casos analisados, as integrações que preservaram autonomia operacional por mais tempo tiveram menor perda de talento-chave nos primeiros dezoito meses.',
      'A lição para o conselho: medir sucesso de M&A pela retenção de receita e de pessoas-chave, não pela velocidade da integração de TI.',
    ],
  },
  {
    title: 'O mercado de crédito para pequenas empresas está mudando de mãos',
    dek: 'Fintechs de nicho crescem onde bancos tradicionais recuaram.',
    excerpt: 'Novos entrantes especializados capturam espaço deixado por instituições tradicionais no crédito para PMEs.',
    category: 'business',
    authorIndex: 1,
    accessLevel: 'public',
    heroFile: 'business-2.jpg',
    daysAgo: 4,
    body: [
      'Bancos tradicionais reduziram exposição ao crédito para pequenas empresas depois do aperto de juros, abrindo espaço para operadores especializados.',
      'Esses novos entrantes usam dados operacionais — não só histórico bancário — para decidir risco, o que muda a régua de quem consegue crédito.',
    ],
  },
  {
    title: 'Por que empresas familiares estão contratando o primeiro CEO externo',
    dek: 'Sucessão deixou de ser só sobre a família — virou sobre continuidade de resultado.',
    excerpt: 'Levantamento mostra aumento na contratação de executivos externos para o topo de empresas familiares brasileiras.',
    category: 'business',
    authorIndex: 1,
    accessLevel: 'public',
    heroFile: 'business-3.jpg',
    daysAgo: 6,
    body: [
      'A segunda geração está, cada vez mais, optando por profissionalizar a gestão antes de assumir o controle acionário integral.',
      'O movimento é motivado menos por falta de interesse da família e mais por reconhecimento de que a complexidade do negócio já não cabe em uma curva de aprendizado informal.',
    ],
  },
  {
    title: 'Lideranças que sobrevivem à reestruturação têm um traço em comum',
    dek: 'Não é resiliência — é clareza sobre o que não vão negociar.',
    excerpt: 'Entrevistas com executivos que atravessaram reestruturações revelam um padrão de decisão, não de personalidade.',
    category: 'people',
    authorIndex: 2,
    accessLevel: 'members',
    heroFile: 'people-1.jpg',
    daysAgo: 1,
    body: [
      'Reestruturações testam menos a capacidade técnica de um líder e mais sua clareza sobre quais compromissos são inegociáveis.',
      'Os executivos que mantiveram a confiança do time durante o processo comunicaram, cedo, o que mudaria e o que permaneceria — mesmo sem ter todas as respostas.',
      'A ausência de clareza, mais que a má notícia em si, foi o que mais corroeu a confiança nos casos estudados.',
    ],
  },
  {
    title: 'O retorno ao escritório revelou um problema que não é sobre home office',
    dek: 'Empresas que forçaram a volta sem redesenhar o propósito do espaço físico perderam gente boa.',
    excerpt: 'Dados de rotatividade sugerem que o desenho do trabalho presencial importa mais que a política em si.',
    category: 'people',
    authorIndex: 2,
    accessLevel: 'public',
    heroFile: 'people-2.jpg',
    daysAgo: 5,
    body: [
      'Empresas que exigiram presença sem repensar o que o escritório deveria oferecer viram rotatividade subir, principalmente entre os times de maior desempenho.',
      'O padrão nas empresas com menor perda de talento: presença vinculada a um propósito claro — colaboração, integração de novos funcionários, decisões complexas — não a controle.',
    ],
  },
  {
    title: 'Automação de processos financeiros reduz fechamento contábil de 10 para 3 dias',
    dek: 'O ganho não veio de mais tecnologia — veio de eliminar etapas manuais redundantes primeiro.',
    excerpt: 'Caso de uma operação de médio porte que remapeou o processo de fechamento antes de automatizar.',
    category: 'processes',
    authorIndex: 1,
    accessLevel: 'public',
    heroFile: 'processes-1.jpg',
    daysAgo: 2,
    body: [
      'Antes de automatizar, o time de finanças mapeou cada etapa manual do fechamento contábil e eliminou as que existiam só por hábito.',
      'Só depois desse corte a automação entrou — em menos etapas, com menos pontos de falha, o que tornou o projeto de tecnologia mais simples do que parecia no início.',
      'O fechamento caiu de dez para três dias, e o time de finanças passou a gastar mais tempo analisando número do que produzindo planilha.',
    ],
  },
  {
    title: 'Mapear processo antes de contratar consultoria de eficiência operacional',
    dek: 'O diagnóstico interno, feito por quem executa o processo, é o que mais economiza tempo de consultoria.',
    excerpt: 'Times que documentaram seus próprios processos antes de contratar consultoria reduziram o tempo de diagnóstico externo à metade.',
    category: 'processes',
    authorIndex: 1,
    accessLevel: 'members',
    heroFile: 'processes-2.jpg',
    daysAgo: 7,
    body: [
      'Consultorias de eficiência operacional gastam boa parte do contrato só entendendo como o processo funciona hoje — tempo que a própria empresa pode adiantar.',
      'Um mapeamento simples, feito por quem executa a rotina, entregue como ponto de partida, reduziu o tempo de diagnóstico externo em projetos comparáveis.',
    ],
  },
]

async function upsertCategory(payload: Awaited<ReturnType<typeof getPayload>>, seed: (typeof CATEGORY_SEEDS)[number]) {
  const existing = await payload.find({ collection: 'categories', where: { key: { equals: seed.key } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  return payload.create({ collection: 'categories', data: seed })
}

async function upsertAuthor(payload: Awaited<ReturnType<typeof getPayload>>, seed: (typeof AUTHOR_SEEDS)[number]) {
  const existing = await payload.find({ collection: 'authors', where: { name: { equals: seed.name } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]

  const avatar = await upsertMedia(payload, seed.avatarFile, `Foto de ${seed.name}`)
  return payload.create({
    collection: 'authors',
    data: { name: seed.name, role: seed.role, bio: seed.bio, avatar: avatar.id },
  })
}

async function upsertMedia(payload: Awaited<ReturnType<typeof getPayload>>, filename: string, alt: string) {
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]

  const filePath = path.join(ASSETS_DIR, filename)
  const data = fs.readFileSync(filePath)
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype: 'image/jpeg', name: filename, size: data.byteLength },
  })
}

async function run() {
  const payload = await getPayload({ config })

  console.log('Seed: categorias…')
  const categories = new Map<CategoryKey, Awaited<ReturnType<typeof upsertCategory>>>()
  for (const seed of CATEGORY_SEEDS) {
    categories.set(seed.key, await upsertCategory(payload, seed))
  }

  console.log('Seed: autores…')
  const authors = []
  for (const seed of AUTHOR_SEEDS) {
    authors.push(await upsertAuthor(payload, seed))
  }

  console.log('Seed: anúncios de exemplo…')
  const adImage = await upsertMedia(payload, 'ad-1.jpg', 'Anúncio de exemplo')
  for (const slot of ['homepage-after-hero', 'section-sidebar', 'article-inline'] as const) {
    const existing = await payload.find({ collection: 'ads', where: { slot: { equals: slot } }, limit: 1 })
    if (!existing.docs[0]) {
      await payload.create({
        collection: 'ads',
        data: { advertiser: 'Claudim', slot, image: adImage.id, url: 'https://claudim.com.br', active: true },
      })
    }
  }

  console.log('Seed: artigos…')
  for (const seed of ARTICLE_SEEDS) {
    const slug = slugify(seed.title)
    const existing = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1 })
    if (existing.docs[0]) continue

    const heroImage = await upsertMedia(payload, seed.heroFile, seed.title)
    const publishedAt = new Date(Date.now() - seed.daysAgo * 24 * 60 * 60 * 1000).toISOString()

    await payload.create({
      collection: 'articles',
      data: {
        title: seed.title,
        dek: seed.dek,
        excerpt: seed.excerpt,
        heroImage: heroImage.id,
        category: categories.get(seed.category)!.id,
        authors: [authors[seed.authorIndex]!.id],
        body: buildRichText(seed.body),
        accessLevel: seed.accessLevel,
        featured: seed.featured ?? false,
        publishedAt,
        _status: 'published',
      },
    })
  }

  console.log('Seed concluído.')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
