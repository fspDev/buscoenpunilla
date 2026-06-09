'use client'

import { useFormStatus } from 'react-dom'

interface Props {
  label: string
  loadingLabel?: string
  className?: string
  disabled?: boolean
}

export function SubmitButton({ label, loadingLabel = 'Procesando...', className = '', disabled = false }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`w-full rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? loadingLabel : label}
    </button>
  )
}
