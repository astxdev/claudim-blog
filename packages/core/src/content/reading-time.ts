/**
 * @file reading-time.ts
 * @description Cálculo do tempo estimado de leitura de um artigo
 *
 * Responsabilidade: regra de negócio pura de apresentação editorial
 * (usada no card de artigo e no cabeçalho da matéria)
 * Camada: core
 *
 * @example
 * const minutos = calculateReadingTimeMinutes(840) // 4
 */

const DEFAULT_WORDS_PER_MINUTE = 200

/**
 * @param wordCount - quantidade de palavras do corpo do artigo
 * @param wordsPerMinute - velocidade média de leitura considerada (padrão: 200)
 * @returns tempo de leitura em minutos, arredondado para cima, mínimo de 1
 */
export function calculateReadingTimeMinutes(
  wordCount: number,
  wordsPerMinute: number = DEFAULT_WORDS_PER_MINUTE,
): number {
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}
