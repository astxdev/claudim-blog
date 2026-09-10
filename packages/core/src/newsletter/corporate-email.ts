/**
 * @file corporate-email.ts
 * @description Regra de negócio: o que conta como "e-mail corporativo" para a newsletter
 *
 * Responsabilidade: validar e-mails de assinantes, rejeitando provedores de e-mail
 * gratuito/pessoal (Gmail, Yahoo, Hotmail etc.)
 * Camada: core
 *
 * @example
 * const resultado = validateCorporateEmail("ana@empresa.com.br")
 */

/**
 * Domínios de e-mail gratuito/pessoal não aceitos como e-mail corporativo.
 *
 * Por que existe: a newsletter é posicionada como conteúdo B2B para profissionais —
 * aceitar e-mail pessoal dilui a qualidade da base e da segmentação por empresa.
 * Esta lista é a ÚNICA fonte de verdade da regra: tanto a validação client-side
 * (feedback instantâneo) quanto a validação server-side (garantia real) devem
 * importar esta constante em vez de duplicá-la.
 */
export const FREE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.com.br",
  "hotmail.com",
  "hotmail.com.br",
  "outlook.com",
  "outlook.com.br",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
  "ig.com.br",
  "globo.com",
  "zipmail.com.br",
  "r7.com",
  "protonmail.com",
  "proton.me",
])

export type CorporateEmailError =
  | { readonly reason: "invalid-format" }
  | { readonly reason: "free-email-provider"; readonly domain: string }

export type CorporateEmailResult =
  | { readonly ok: true; readonly email: string }
  | { readonly ok: false; readonly error: CorporateEmailError }

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Valida se uma string é um e-mail corporativo aceitável para a newsletter.
 *
 * @param rawEmail - valor bruto digitado pelo usuário no formulário
 * @returns um `CorporateEmailResult` — nunca lança exceção, sempre narrow o resultado
 *
 * @example
 * const r = validateCorporateEmail("ana@gmail.com")
 * // r = { ok: false, error: { reason: "free-email-provider", domain: "gmail.com" } }
 */
export function validateCorporateEmail(rawEmail: string): CorporateEmailResult {
  const email = rawEmail.trim().toLowerCase()

  if (!EMAIL_FORMAT.test(email)) {
    return { ok: false, error: { reason: "invalid-format" } }
  }

  const domain = email.split("@")[1]
  if (domain !== undefined && FREE_EMAIL_DOMAINS.has(domain)) {
    return { ok: false, error: { reason: "free-email-provider", domain } }
  }

  return { ok: true, email }
}
