/**
 * @file cms-client.ts
 * @description Cliente HTTP para a API REST do Payload rodando remotamente (a VPS)
 *
 * Responsabilidade: o frontend (deploy na Vercel) não tem mais o Payload
 * embutido — todo o CMS + Postgres vive num Payload separado, hospedado em
 * PAYLOAD_CMS_URL. Este módulo é a única porta de saída pra esse serviço;
 * nada mais no app deve montar essas URLs na mão.
 * Camada: web
 *
 * @example
 * const { docs } = await cmsFind<Article>('articles', { where: { featured: { equals: true } } })
 */

const CMS_URL = process.env.PAYLOAD_CMS_URL ?? 'http://localhost:3000'

type WhereClause = Record<string, Record<string, boolean | number | string>>

export interface FindResult<T> {
  docs: T[]
}

function buildSearchParams(params: {
  depth?: number
  limit?: number
  sort?: string
  where?: WhereClause
}): string {
  const search = new URLSearchParams()
  if (params.sort) search.set('sort', params.sort)
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.depth !== undefined) search.set('depth', String(params.depth))

  if (params.where) {
    for (const [field, conditions] of Object.entries(params.where)) {
      for (const [operator, value] of Object.entries(conditions)) {
        search.set(`where[${field}][${operator}]`, String(value))
      }
    }
  }

  return search.toString()
}

/**
 * @param collection - slug da collection no Payload remoto
 * @param params - filtros/paginação equivalentes ao `payload.find()` local
 * @returns o mesmo formato `{ docs: [...] }` da Local API
 * @throws {Error} quando o CMS remoto responde com erro HTTP
 */
export async function cmsFind<T>(
  collection: string,
  params: { depth?: number; limit?: number; sort?: string; where?: WhereClause } = {},
): Promise<FindResult<T>> {
  const qs = buildSearchParams(params)
  const res = await fetch(`${CMS_URL}/api/${collection}${qs ? `?${qs}` : ''}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Falha ao buscar "${collection}" no CMS (${res.status})`)
  }

  return res.json() as Promise<FindResult<T>>
}

/**
 * Resolve uma URL de mídia vinda do Payload remoto: caminhos relativos
 * (ex: `/api/media/file/foo.jpg`) apontam pro domínio do CMS, não pro
 * domínio do frontend — sem isso as imagens quebram em produção.
 *
 * @param url - valor bruto de `Media.url` retornado pela API
 * @returns URL absoluta pronta pra usar em `next/image`
 */
export function resolveMediaUrl(url: null | string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `${CMS_URL}${url}`
}
