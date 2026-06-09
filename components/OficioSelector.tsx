'use client'

import { useState } from 'react'

interface Props {
  oficiosDisponibles: string[]
  defaultSelected?: string[]
  defaultPropuesta?: string
  onChange?: (selected: string[], propuesta: string) => void
  max?: number
}

export function OficioSelector({
  oficiosDisponibles,
  defaultSelected = [],
  defaultPropuesta = '',
  onChange,
  max = 5,
}: Props) {
  const [selected, setSelected]           = useState<string[]>(defaultSelected)
  const [propuestaModo, setPropuestaModo] = useState(!!defaultPropuesta)
  const [propuesta, setPropuesta]         = useState(defaultPropuesta)
  const [propuestaConfirmada, setPropuestaConfirmada] = useState(!!defaultPropuesta)

  function notify(nextSelected: string[], nextPropuesta: string) {
    onChange?.(nextSelected, nextPropuesta)
  }

  function toggle(oficio: string) {
    let next: string[]
    if (selected.includes(oficio)) {
      next = selected.filter((o) => o !== oficio)
    } else if (selected.length < max) {
      next = [...selected, oficio]
    } else {
      return
    }
    setSelected(next)
    notify(next, propuestaModo ? propuesta : '')
  }

  function togglePropuestaModo() {
    const activar = !propuestaModo
    setPropuestaModo(activar)
    setPropuestaConfirmada(false)
    let next = selected
    if (activar) {
      if (!selected.includes('Otro') && selected.length < max) {
        next = [...selected, 'Otro']
        setSelected(next)
      }
    } else {
      next = selected.filter((o) => o !== 'Otro')
      setSelected(next)
      setPropuesta('')
    }
    notify(next, activar ? propuesta : '')
  }

  function handlePropuesta(v: string) {
    const trimmed = v.slice(0, 60)
    setPropuesta(trimmed)
    setPropuestaConfirmada(false)
    notify(selected, trimmed)
  }

  function confirmarPropuesta() {
    if (!propuesta.trim()) return
    setPropuestaConfirmada(true)
    notify(selected, propuesta.trim())
  }

  const sinSeleccion = selected.length === 0 && !propuestaModo

  return (
    <div className="space-y-3">
      <p className="text-xs text-on-surface-variant">
        {selected.length} de {max} seleccionados
        {sinSeleccion && <span className="text-ds-error"> (requerido)</span>}
      </p>

      <div className="flex flex-wrap gap-2">
        {oficiosDisponibles.map((o) => {
          const sel       = selected.includes(o)
          const esPrimero = selected[0] === o
          const lleno     = !sel && selected.length >= max
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              disabled={lleno}
              className={`min-h-[44px] rounded-lg border px-3 py-2 text-sm font-medium transition
                ${sel
                  ? esPrimero
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-primary-container bg-surface-low text-primary-container'
                  : lleno
                    ? 'cursor-not-allowed border-outline-variant text-outline opacity-50'
                    : 'border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-on-surface'
                }`}
            >
              {o}
              {esPrimero && <span className="ml-1 text-xs opacity-70">(principal)</span>}
            </button>
          )
        })}

        {/* Botón para activar modo propuesta */}
        <button
          type="button"
          onClick={togglePropuestaModo}
          className={`min-h-[44px] rounded-lg border px-3 py-2 text-sm font-medium transition
            ${propuestaModo
              ? 'border-secondary-container bg-secondary-container text-on-secondary-container'
              : 'border-dashed border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
            }`}
        >
          {propuestaModo ? '✕ Cancelar propuesta' : '+ Mi oficio no está en la lista'}
        </button>
      </div>

      {/* Campo de propuesta */}
      {propuestaModo && (
        <div className="rounded-lg border border-secondary-container bg-surface-low p-3 space-y-2">
          {propuestaConfirmada ? (
            <div className="rounded-lg bg-secondary/10 border border-secondary/30 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-secondary flex items-center gap-1">
                    <span className="text-base">✓</span>
                    Propuesta enviada al admin
                  </p>
                  <p className="text-sm text-on-surface font-medium">
                    <strong>{propuesta}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPropuestaConfirmada(false)}
                  className="flex-shrink-0 text-xs text-secondary underline hover:text-secondary/80 font-medium"
                >
                  Editar
                </button>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Será revisada y aprobada por el admin en menos de 48 horas. Tu perfil se mostrará como <strong>Otro</strong> hasta que se apruebe.
              </p>
            </div>
          ) : (
            <>
              <label className="block text-sm font-medium text-on-surface">
                ¿Cómo se llama tu oficio?
              </label>
              <input
                type="text"
                value={propuesta}
                onChange={(e) => handlePropuesta(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmarPropuesta() } }}
                placeholder="Ej: Instalación de paneles solares"
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
              />
              <div className="space-y-2">
                <p className="text-xs text-on-surface-variant">
                  Tu oficio será revisado y aprobado por el admin en menos de 48 horas.
                  Mientras tanto, tu perfil quedará activo como <strong>Otro</strong>.
                </p>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <p className="text-right text-xs text-outline mb-1">{propuesta.length}/60</p>
                    <button
                      type="button"
                      onClick={confirmarPropuesta}
                      disabled={!propuesta.trim()}
                      className="w-full rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ✓ Enviar propuesta al admin
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-outline">El primer oficio que seleccionés será el principal.</p>

      {/* Hidden inputs para el formulario */}
      <input type="hidden" name="oficios_json" value={JSON.stringify(selected)} />
      {propuestaModo && propuesta.trim() && (
        <input type="hidden" name="oficio_propuesto" value={propuesta.trim()} />
      )}
    </div>
  )
}
