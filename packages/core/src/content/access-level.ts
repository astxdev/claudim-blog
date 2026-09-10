/**
 * @file access-level.ts
 * @description Nível de acesso editorial de um post (público vs. exclusivo para assinantes)
 *
 * Responsabilidade: regra de negócio de quem pode ler o conteúdo completo
 * Camada: core
 */

export const ARTICLE_ACCESS_LEVELS = ["public", "members"] as const

export type ArticleAccessLevel = (typeof ARTICLE_ACCESS_LEVELS)[number]

/**
 * No MVP não há autenticação de assinante — todo post "members" é sempre
 * mostrado como teaser (chamada para assinar a newsletter). Esta função é o
 * único ponto de decisão dessa regra, para trocar por uma checagem de sessão
 * real no futuro sem espalhar `if`s pelo app inteiro.
 *
 * @param accessLevel - nível de acesso do post
 * @returns `true` quando o conteúdo completo deve ser renderizado
 */
export function canRenderFullContent(accessLevel: ArticleAccessLevel): boolean {
  return accessLevel === "public"
}
