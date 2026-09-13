export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://claudim.com.br').replace(/\/$/, '')
export const SITE_NAME = 'Claudim'
export const SITE_DESCRIPTION =
  'Notícias e análises sobre tecnologia, negócios, pessoas e processos para quem decide.'

export function absoluteUrl(path = '/') {
  return new URL(path, `${SITE_URL}/`).toString()
}
