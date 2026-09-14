'use client'

import { useState, type FormEvent } from 'react'
import {
  INTEREST_AREAS,
  INTEREST_AREA_LABELS_PT_BR,
  describeSubscriberValidationError,
  validateSubscriberInput,
  type InterestArea,
} from '@claudim/core'

type Status = 'error' | 'idle' | 'submitting' | 'success'

interface NewsletterFormProps {
  compact?: boolean
  idPrefix: string
}

export function NewsletterForm({ compact = false, idPrefix }: NewsletterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState<InterestArea[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function toggleInterest(area: InterestArea) {
    setInterests((current) =>
      current.includes(area) ? current.filter((item) => item !== area) : [...current, area],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validation = validateSubscriberInput({ name, email, interests })
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
        <label htmlFor={`${idPrefix}-name`} className={compact ? 'sr-only' : 'text-ink text-sm font-semibold'}>
          Seu nome
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          name="name"
          autoComplete="name"
          placeholder={compact ? 'Seu nome' : undefined}
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? `${idPrefix}-name-error` : undefined}
          className={
            compact
              ? 'h-9 w-32 rounded-full border-0 bg-white/15 px-3 text-sm text-ink-inverse placeholder:text-ink-inverse/60 focus:bg-white/25 focus:outline-none sm:w-36'
              : 'border-border h-11 rounded-lg border px-3 text-sm'
          }
        />
        {!compact && fieldErrors.name && <p id={`${idPrefix}-name-error`} className="text-xs text-red-700">{fieldErrors.name}</p>}
      </div>

      <div className={compact ? 'contents' : 'flex flex-col gap-1'}>
        <label htmlFor={`${idPrefix}-email`} className={compact ? 'sr-only' : 'text-ink text-sm font-semibold'}>
          E-mail corporativo
        </label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={compact ? 'E-mail corporativo' : undefined}
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

      <fieldset
        className={compact ? 'hidden items-center gap-1 lg:flex' : 'flex flex-col gap-2'}
        aria-describedby={fieldErrors.interests ? `${idPrefix}-interests-error` : undefined}
      >
        <legend className={compact ? 'sr-only' : 'text-ink text-sm font-semibold'}>
          Escolha os temas que você quer receber
        </legend>
        {!compact && <p className="text-ink-muted text-xs">Selecione um ou mais assuntos:</p>}
        <div className="flex flex-wrap items-center gap-2">
          {compact && <span className="text-xs text-ink-inverse/70">Temas:</span>}
          {INTEREST_AREAS.map((area) => {
            const selected = interests.includes(area)
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleInterest(area)}
                aria-pressed={selected}
                aria-label={`${selected ? 'Remover' : 'Selecionar'} tema ${INTEREST_AREA_LABELS_PT_BR[area]}`}
                className={
                  compact
                    ? `h-9 rounded-full px-3 text-xs font-medium transition-colors ${selected ? 'bg-white text-ink' : 'bg-white/15 text-ink-inverse/85 hover:bg-white/25'}`
                    : `rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${selected ? 'border-accent-strong bg-accent-strong text-white' : 'border-border text-ink-muted hover:border-ink'}`
                }
              >
                {INTEREST_AREA_LABELS_PT_BR[area]}
              </button>
            )
          })}
        </div>
      </fieldset>
      {!compact && fieldErrors.interests && (
        <p id={`${idPrefix}-interests-error`} className="text-xs text-red-700">
          {fieldErrors.interests}
        </p>
      )}

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
