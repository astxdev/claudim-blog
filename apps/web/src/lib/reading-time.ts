/**
 * @file reading-time.ts
 * @description Extrai o tempo de leitura estimado de um corpo richText (Lexical)
 *
 * Responsabilidade: traduzir o JSON do Lexical em contagem de palavras — o
 * cálculo de minutos em si é regra de negócio pura e vem de @claudim/core.
 * Camada: web
 */
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import { calculateReadingTimeMinutes } from '@claudim/core'
import type { Article } from '@/payload-types'

/**
 * @param body - campo `body` (richText Lexical) de um Article
 * @returns tempo de leitura em minutos
 */
export function estimateReadingTimeMinutes(body: Article['body']): number {
  const plainText = convertLexicalToPlaintext({ data: body })
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length
  return calculateReadingTimeMinutes(wordCount)
}
