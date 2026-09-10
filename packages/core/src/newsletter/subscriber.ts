/**
 * @file subscriber.ts
 * @description Entidade de domínio Subscriber e validação completa do formulário de newsletter
 *
 * Responsabilidade: consolidar as regras de negócio de uma inscrição válida
 * (nome preenchido, e-mail corporativo, ao menos uma área de interesse)
 * Camada: core
 *
 * @example
 * const resultado = validateSubscriberInput({ name: "Ana", email: "ana@empresa.com", interests: ["tech"] })
 */
import { validateCorporateEmail, type CorporateEmailError } from "./corporate-email"
import { isInterestArea, type InterestArea } from "./interest-area"

export interface Subscriber {
  readonly name: string
  readonly email: string
  readonly interests: readonly InterestArea[]
  readonly subscribedAt: Date
  readonly source: string
}

export interface SubscriberInput {
  readonly name: unknown
  readonly email: unknown
  readonly interests: unknown
}

export type SubscriberValidationError =
  | { readonly field: "name"; readonly reason: "required" }
  | { readonly field: "email"; readonly reason: CorporateEmailError["reason"]; readonly domain?: string }
  | { readonly field: "interests"; readonly reason: "required" }

export type SubscriberValidationResult =
  | { readonly ok: true; readonly value: { name: string; email: string; interests: InterestArea[] } }
  | { readonly ok: false; readonly errors: readonly SubscriberValidationError[] }

/**
 * Valida um payload não confiável de inscrição na newsletter (ex: `req.body`).
 *
 * @param input - dados brutos recebidos do formulário/API, ainda não tipados
 * @returns lista de erros por campo, ou o valor já normalizado quando válido
 */
export function validateSubscriberInput(input: SubscriberInput): SubscriberValidationResult {
  const errors: SubscriberValidationError[] = []

  const name = typeof input.name === "string" ? input.name.trim() : ""
  if (name.length === 0) {
    errors.push({ field: "name", reason: "required" })
  }

  const emailResult = validateCorporateEmail(typeof input.email === "string" ? input.email : "")
  if (!emailResult.ok) {
    errors.push({
      field: "email",
      reason: emailResult.error.reason,
      domain: emailResult.error.reason === "free-email-provider" ? emailResult.error.domain : undefined,
    })
  }

  const interests = Array.isArray(input.interests) ? input.interests.filter(isInterestArea) : []
  if (interests.length === 0) {
    errors.push({ field: "interests", reason: "required" })
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: { name, email: emailResult.ok ? emailResult.email : "", interests },
  }
}

/**
 * Mensagem em pt-BR para um erro de validação do formulário de newsletter.
 *
 * Único ponto de tradução erro → texto — usado tanto pelo hook do Payload
 * (garantia real, server-side) quanto pelo formulário no navegador (feedback
 * instantâneo), para as duas camadas nunca divergirem no que dizem ao usuário.
 *
 * @param error - erro retornado por `validateSubscriberInput`
 * @returns mensagem pronta para exibir ao lado do campo
 */
export function describeSubscriberValidationError(error: SubscriberValidationError): string {
  switch (error.field) {
    case "name":
      return "Informe seu nome."
    case "email":
      if (error.reason === "free-email-provider") {
        return `Use seu e-mail corporativo — ${error.domain} não é aceito.`
      }
      return "Informe um e-mail válido."
    case "interests":
      return "Selecione ao menos uma área de interesse."
  }
}
