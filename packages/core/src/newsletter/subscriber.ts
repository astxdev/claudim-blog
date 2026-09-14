/**
 * @file subscriber.ts
 * @description Entidade de domínio Subscriber e validação completa do formulário de newsletter
 *
 * Responsabilidade: consolidar as regras de negócio de uma inscrição válida
 * (e-mail corporativo)
 * Camada: core
 *
 * @example
 * const resultado = validateSubscriberInput({ email: "ana@empresa.com" })
 */
import { validateCorporateEmail, type CorporateEmailError } from "./corporate-email"

export interface Subscriber {
  readonly email: string
  readonly subscribedAt: Date
  readonly source: string
}

export interface SubscriberInput {
  readonly email: unknown
}

export type SubscriberValidationError =
  { readonly field: "email"; readonly reason: CorporateEmailError["reason"]; readonly domain?: string }

export type SubscriberValidationResult =
  | { readonly ok: true; readonly value: { email: string } }
  | { readonly ok: false; readonly errors: readonly SubscriberValidationError[] }

/**
 * Valida um payload não confiável de inscrição na newsletter (ex: `req.body`).
 *
 * @param input - dados brutos recebidos do formulário/API, ainda não tipados
 * @returns lista de erros por campo, ou o valor já normalizado quando válido
 */
export function validateSubscriberInput(input: SubscriberInput): SubscriberValidationResult {
  const errors: SubscriberValidationError[] = []

  const emailResult = validateCorporateEmail(typeof input.email === "string" ? input.email : "")
  if (!emailResult.ok) {
    errors.push({
      field: "email",
      reason: emailResult.error.reason,
      domain: emailResult.error.reason === "free-email-provider" ? emailResult.error.domain : undefined,
    })
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: { email: emailResult.ok ? emailResult.email : "" },
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
    case "email":
      if (error.reason === "free-email-provider") {
        return `Use seu e-mail corporativo — ${error.domain} não é aceito.`
      }
      return "Informe um e-mail válido."
  }
}
