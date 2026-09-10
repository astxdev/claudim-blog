/**
 * @file interest-area.ts
 * @description Áreas de interesse que um assinante pode escolher na newsletter
 *
 * Responsabilidade: definir o vocabulário fechado de áreas de interesse,
 * espelhando as 4 categorias editoriais do portal (Tecnologia, Negócios,
 * Pessoas, Processos)
 * Camada: core
 */

export const INTEREST_AREAS = ["tech", "business", "people", "processes"] as const

export type InterestArea = (typeof INTEREST_AREAS)[number]

export const INTEREST_AREA_LABELS_PT_BR: Readonly<Record<InterestArea, string>> = {
  tech: "Tecnologia",
  business: "Negócios",
  people: "Pessoas",
  processes: "Processos",
}

/**
 * Narrowing seguro de `unknown` para `InterestArea`, usado ao validar payloads
 * que chegam de fora (formulário, API) e ainda não são tipados.
 *
 * @param value - valor não confiável (ex: vindo de `JSON.parse`)
 * @returns `true` se `value` for uma das áreas de interesse válidas
 */
export function isInterestArea(value: unknown): value is InterestArea {
  return typeof value === "string" && (INTEREST_AREAS as readonly string[]).includes(value)
}
