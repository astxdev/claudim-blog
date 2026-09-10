/**
 * @file slugify.ts
 * @description Geração de slug de URL a partir de um título editorial
 *
 * Responsabilidade: regra de negócio de como um título vira uma URL amigável
 * (usado tanto no hook do Payload quanto em qualquer teste/preview)
 * Camada: core
 *
 * @example
 * slugify("IA não faz mágica: 5 passos") // "ia-nao-faz-magica-5-passos"
 */

const COMBINING_MARKS = /\p{Mn}/gu

/**
 * @param title - título bruto do artigo/categoria/tag
 * @returns slug em minúsculas, sem acentos, separado por hífens
 */
export function slugify(title: string): string {
  return title
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
