/**
 * @file route.ts
 * @description Endpoint público de inscrição na newsletter
 *
 * Responsabilidade: receber o payload do formulário (inline no desktop ou do
 * modal mobile), delegar a validação real para a coleção `newsletter-subscribers`
 * (que usa `@claudim/core`) e, em caso de sucesso, publicar o Domain Event
 * `subscriber.registered` para o handler de `@claudim/infra`.
 * Camada: web (App Router route handler)
 */
import configPromise from '@payload-config'
import { getPayload, ValidationError } from 'payload'
import { createSubscriberRegisteredEvent, isInterestArea } from '@claudim/core'
import { handleSubscriberRegistered } from '@claudim/infra'

type FieldErrors = Record<string, string>

/**
 * @param request - corpo esperado: `{ name, email, interests }`
 * @returns 201 em caso de sucesso, 400 com erros por campo, 500 em falha inesperada
 */
export async function POST(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null)

  if (body === null || typeof body !== 'object') {
    return Response.json({ errors: { form: 'Payload inválido.' } satisfies FieldErrors }, { status: 400 })
  }

  const { name, email, interests } = body as Record<string, unknown>
  const submission = {
    name: typeof name === 'string' ? name : '',
    email: typeof email === 'string' ? email : '',
    interests: (Array.isArray(interests) ? interests : []).filter(isInterestArea),
  }
  const payload = await getPayload({ config: configPromise })

  try {
    await payload.create({
      collection: 'newsletter-subscribers',
      data: {
        ...submission,
        source: 'website',
        subscribedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    if (error instanceof ValidationError) {
      const fieldErrors: FieldErrors = {}
      for (const fieldError of error.data.errors) {
        fieldErrors[fieldError.path] = fieldError.message
      }
      return Response.json({ errors: fieldErrors }, { status: 400 })
    }

    console.error('newsletter subscription failed', error)
    return Response.json({ errors: { form: 'Não foi possível concluir a inscrição.' } satisfies FieldErrors }, { status: 500 })
  }

  await handleSubscriberRegistered(createSubscriberRegisteredEvent(submission))

  return Response.json({ ok: true }, { status: 201 })
}
