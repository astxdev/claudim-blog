/**
 * @file format.ts
 * @description Formatação de datas em pt-BR usada nos cards e no cabeçalho do artigo
 * Camada: web
 */

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function formatPublishedDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return ''

  return dateFormatter.format(date)
}
