/**
 * @file subscriber-registered.ts
 * @description Contrato do Domain Event disparado quando um novo assinante se registra
 *
 * Responsabilidade: desacoplar a regra "alguém assinou a newsletter" de QUEM reage
 * a isso (hoje: nada, é só um log; no futuro: um adapter de ESP como Resend/Mailchimp
 * em `packages/infra`). Nenhum código de infraestrutura é importado aqui.
 * Camada: core
 *
 * @example
 * const evento = createSubscriberRegisteredEvent({ name: "Ana", email: "ana@empresa.com", interests: ["tech"] })
 */
export interface SubscriberRegisteredEvent {
  readonly type: "subscriber.registered"
  readonly occurredAt: Date
  readonly payload: {
    readonly email: string
  }
}

/**
 * @param subscriber - dados já validados do assinante
 * @returns evento de domínio pronto para ser publicado por um handler de infra
 */
export function createSubscriberRegisteredEvent(subscriber: {
  email: string
}): SubscriberRegisteredEvent {
  return {
    type: "subscriber.registered",
    occurredAt: new Date(),
    payload: subscriber,
  }
}
