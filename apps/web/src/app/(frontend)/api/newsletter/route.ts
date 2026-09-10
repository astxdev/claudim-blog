/**
 * @file route.ts
 * @description Endpoint público de inscrição na newsletter
 *
 * Responsabilidade: repassar o payload do formulário (inline no desktop ou do
 * modal mobile) para a coleção `newsletter-subscribers` no Payload remoto
 * (a VPS, via API REST) e traduzir os erros de validação em algo que o
 * formulário consiga exibir por campo. A validação de verdade (e-mail
 * corporativo etc.) e o disparo do Domain Event acontecem no próprio Payload
 * remoto — este endpoint é só uma fachada estável (`/api/newsletter`) por
 * cima de onde o CMS realmente estiver hospedado.
 * Camada: web (App Router route handler)
 */
import { isInterestArea } from '@claudim/core'

const CMS_URL = process.env.PAYLOAD_CMS_URL ?? 'http://localhost:3000'

type FieldErrors = Record<string, string>

interface PayloadRestErrorBody {
  errors?: Array<{
    data?: { errors?: Array<{ message: string; path: string }> }
    message?: string
  }>
}

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
    source: 'website',
    subscribedAt: new Date().toISOString(),
  }

  let response: Response
  try {
    response = await fetch(`${CMS_URL}/api/newsletter-subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    })
  } catch (error) {
    console.error('newsletter subscription: CMS unreachable', error)
    return Response.json({ errors: { form: 'Não foi possível concluir a inscrição.' } satisfies FieldErrors }, { status: 502 })
  }

  if (!response.ok) {
    const payload: PayloadRestErrorBody = await response.json().catch(() => ({}))
    const fieldErrors: FieldErrors = {}
    for (const fieldError of payload.errors?.[0]?.data?.errors ?? []) {
      fieldErrors[fieldError.path] = fieldError.message
    }
    if (Object.keys(fieldErrors).length === 0) {
      fieldErrors.form = 'Não foi possível concluir a inscrição.'
    }
    return Response.json({ errors: fieldErrors }, { status: 400 })
  }

  return Response.json({ ok: true }, { status: 201 })
}
