'use client'

import { useState, type FormEvent } from 'react'
import {
  describeSubscriberValidationError,
  validateSubscriberInput,
} from '@claudim/core'

type Status = 'error' | 'idle' | 'submitting' | 'success'

interface NewsletterFormProps {
  compact?: boolean
  idPrefix: string
}

export function NewsletterForm({ compact = false, idPrefix }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateSubscriberInput({ email })
    if (!validation.ok) {
      const errors: Record<string, string> = {}
      for (const error of validation.errors) {
        errors[error.field] = describeSubscriberValidationError(error)
      }
      setFieldErrors(errors)
      setStatus('error')
      return
    }

    setStatus('submitting')
    setFieldErrors({})

    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.value),
    })

    if (response.ok) {
      setStatus('success')
      return
    }

    const payload: { errors?: Record<string, string> } = await response.json().catch(() => ({}))
    setFieldErrors(payload.errors ?? { form: 'Não foi possível concluir a inscrição.' })
    setStatus('error')
  }

  if (status === 'success') {
    return (
      <p className={compact ? 'text-sm font-medium text-ink-inverse' : 'text-ink text-base font-medium'}>
        Inscrição confirmada! Fique de olho no seu e-mail corporativo.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={status === 'submitting'}
      className={compact ? 'flex flex-wrap items-center gap-2' : 'flex flex-col gap-4'}
    >
      <div className={compact ? 'contents' : 'flex flex-col gap-1'}>
        <label htmlFor={`${idPrefix}-email`} className={compact ? 'sr-only' : 'text-ink text-sm font-semibold'}>
          E-mail corporativo
        </label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="E-mail corporativo"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? `${idPrefix}-email-error` : undefined}
          className={
            compact
              ? 'h-9 w-44 rounded-full border-0 bg-white/15 px-3 text-sm text-ink-inverse placeholder:text-ink-inverse/60 focus:bg-white/25 focus:outline-none sm:w-52'
              : 'border-border h-11 rounded-lg border px-3 text-sm'
          }
        />
        {!compact && fieldErrors.email && <p id={`${idPrefix}-email-error`} className="text-xs text-red-700">{fieldErrors.email}</p>}
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className={
          compact
            ? 'h-10 rounded-full bg-accent-strong px-5 text-sm font-bold text-white shadow-md ring-2 ring-white/20 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-60'
            : 'bg-accent-strong h-11 rounded-lg px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-accent-strong focus-visible:outline-none disabled:opacity-60'
        }
      >
        {status === 'submitting' ? 'Enviando…' : 'Assinar'}
      </button>

      {fieldErrors.form && <p className="text-xs text-red-700">{fieldErrors.form}</p>}
    </form>
  )
}
