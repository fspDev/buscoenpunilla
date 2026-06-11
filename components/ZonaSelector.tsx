'use client'

import { useState } from 'react'

interface Props {
  zonasDisponibles: string[]
  defaultSelected?: string[]
  defaultPropuesta?: string
  onChange?: (selected: string[], propuesta: string) => void
}

export function ZonaSelector({
  zonasDisponibles,
  defaultSelected = [],
  defaultPropuesta = '',
  onChange,
}: Props) {
  const [selected, setSelected]           = useState<string[]>(defaultSelected)
  const [propuestaModo, setPropuestaModo] = useState(!!defaultPropuesta)
  const [propuesta, setPropuesta]         = useState(defaultPropuesta)
  const [propuestaConfirmada, setPropuestaConfirmada] = useState(!!defaultPropuesta)

  function notify(nextSelected: string[], nextPropuesta: string) {
    onChange?.(nextSelected, nextPropuesta)
  }

  function toggle(zona: string) {
    const next = selected.includes(zona)
      ? selected.filter((z) => z !== zona)
      : [...selected, zona]
    setSelected(next)
    notify(next, propuestaModo ? propuesta : '')
  }

  function togglePropuestaModo() {
    const activar = !propuestaModo
    setPropuestaModo(activar)
    setPropuestaConfirmada(false)
    if (!activar) setPropuesta('')
    notify(selected, activar ? propuesta : '')
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

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {zonasDisponibles.map((z) => {
          const sel = selected.includes(z)
          return (
            <button
              key={z}
              type="button"
              onClick={() => toggle(z)}
              className={`min-h-[36px] rounded-full border px-3 py-1 text-sm font-medium transition
                ${sel
                  ? 'border-primary-container bg-surface-low text-primary-container'
                  : 'border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-on-surface'
                }`}
            >
              {z}
            </button>
          )
        })}

        {/* Botón para activar modo propuesta */}
        <button
          type="button"
          onClick={togglePropuestaModo}
          className={`min-h-[36px] rounded-full border px-3 py-1 text-sm font-medium transition
            ${propuestaModo
              ? 'border-secondary-container bg-secondary-container text-on-secondary-container'
              : 'border-dashed border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
            }`}
        >
          {propuestaModo ? '✕ Cancelar propuesta' : '+ Mi zona no está en la lista'}
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
                    Zona propuesta lista
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
                <strong>Importante:</strong> la propuesta se envía al admin recién cuando guardes el formulario.
                Después será revisada en menos de 48 horas.
              </p>
            </div>
          ) : (
            <>
              <label className="block text-sm font-medium text-on-surface">
                ¿En qué zona trabajás?
              </label>
              <input
                type="text"
                value={propuesta}
                onChange={(e) => handlePropuesta(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmarPropuesta() } }}
                placeholder="Ej: Tanti"
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
              />
              <div className="space-y-2">
                <p className="text-xs text-on-surface-variant">
                  Tu zona será revisada y aprobada por el admin en menos de 48 horas.
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
                      ✓ Confirmar propuesta
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden inputs para el formulario */}
      {selected.map((z) => <input key={z} type="hidden" name="zonas" value={z} />)}
      {propuestaModo && propuesta.trim() && (
        <input type="hidden" name="zona_propuesta" value={propuesta.trim()} />
      )}
    </div>
  )
}
