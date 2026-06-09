'use client'

import { useState } from 'react'
import { registrarContacto } from '@/app/actions/contacto'
import { formatWhatsApp } from '@/lib/utils'

interface Props {
  numero: string
  nombre_prestador: string
  prestador_id: string
}

function formatDisplay(numero: string): string {
  const digits = numero.replace(/\D/g, '')
  const sin0 = digits.startsWith('0') ? digits.slice(1) : digits
  const local = sin0.startsWith('549') ? sin0.slice(3) : sin0.startsWith('54') ? sin0.slice(2) : sin0
  if (local.length === 10) return `${local.slice(0, 4)} ${local.slice(4, 7)}-${local.slice(7)}`
  return local
}

export function WhatsAppButton({ numero, nombre_prestador, prestador_id }: Props) {
  const [mostrar, setMostrar] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const telefono = formatWhatsApp(numero)
  const mensaje = encodeURIComponent(`Hola ${nombre_prestador}, te encontré en BUSCO y me gustaría consultar por tus servicios.`)
  const urlWA = `https://wa.me/${telefono}?text=${mensaje}`
  const numeroDisplay = formatDisplay(numero)

  async function handleContactar() {
    await registrarContacto(prestador_id)
    setMostrar(true)
  }

  async function handleCopiar() {
    await navigator.clipboard.writeText(numero.replace(/\D/g, ''))
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (mostrar) {
    return (
      <div className="rounded-xl border border-secondary bg-secondary-container px-4 py-3">
        <p className="mb-2 text-xs font-medium text-secondary-on">Número de WhatsApp</p>
        <div className="flex items-center gap-2">
          <span className="flex-1 font-mono text-base font-semibold text-on-surface">{numeroDisplay}</span>
          <button
            onClick={handleCopiar}
            className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface-variant transition hover:bg-surface-low"
          >
            {copiado ? '¡Copiado!' : 'Copiar'}
          </button>
          <a
            href={urlWA}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.112 1.522 5.84L.044 23.5a.5.5 0 0 0 .614.614l5.701-1.49A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.947 0-3.76-.524-5.31-1.435l-.38-.224-3.938 1.028 1.05-3.838-.247-.394A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Abrir WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleContactar}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-base font-semibold text-white shadow-card transition hover:opacity-90 active:scale-95"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.112 1.522 5.84L.044 23.5a.5.5 0 0 0 .614.614l5.701-1.49A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.947 0-3.76-.524-5.31-1.435l-.38-.224-3.938 1.028 1.05-3.838-.247-.394A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
      Contactar por WhatsApp
    </button>
  )
}
