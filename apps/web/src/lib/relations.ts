/**
 * @file relations.ts
 * @description Narrowing de campos de relacionamento do Payload
 *
 * Responsabilidade: o Payload tipa relacionamentos como `number | T` (ID cru
 * ou objeto populado, dependendo do `depth` da query). Como todas as queries
 * em `queries.ts` usam `depth: 2`, este helper só formaliza essa garantia.
 * Camada: web
 */

/**
 * @param value - campo de relacionamento retornado pelo Payload
 * @returns `true` quando o valor já veio populado como objeto
 */
export function isPopulated<T>(value: null | number | T | undefined): value is T {
  return typeof value === 'object' && value !== null
}
