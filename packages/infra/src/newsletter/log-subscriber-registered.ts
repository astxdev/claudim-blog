/**
 * @file log-subscriber-registered.ts
 * @description Adapter que reage ao Domain Event `subscriber.registered`
 *
 * Responsabilidade: implementar o único ponto de reação a uma nova inscrição
 * na newsletter. Hoje só registra um log estruturado; quando a Claudim
 * integrar um ESP (Resend, Mailchimp, etc.), a troca acontece só aqui —
 * nenhum código de `core` ou da rota da API precisa mudar.
 * Camada: infra
 *
 * @example
 * await handleSubscriberRegistered(createSubscriberRegisteredEvent(subscriber))
 */
import type { SubscriberRegisteredEvent } from "@claudim/core"

/**
 * @param event - evento de domínio já construído por `@claudim/core`
 * @returns nada — efeito colateral é o log estruturado
 */
export async function handleSubscriberRegistered(event: SubscriberRegisteredEvent): Promise<void> {
  console.log(
    JSON.stringify({
      event: event.type,
      occurredAt: event.occurredAt.toISOString(),
      email: event.payload.email,
      interests: event.payload.interests,
    }),
  )
}
