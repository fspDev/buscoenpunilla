'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  oficiosDisponibles: string[]
  defaultSelected?: string[]
  defaultPropuesta?: string
  onChange?: (selected: string[], propuesta: string) => void
  max?: number
  suppressHiddenInputs?: boolean
}

export function OficioSelector({
  oficiosDisponibles,
  defaultSelected = [],
  defaultPropuesta = '',
  onChange,
  max = 5,
  suppressHiddenInputs = false,
}: Props) {
  const [selected, setSelected]           = useState<string[]>(defaultSelected)
  const [query, setQuery]                 = useState('')
  const [open, setOpen]                   = useState(false)
  const [propuestaModo, setPropuestaModo] = useState(!!defaultPropuesta)
  const [propuesta, setPropuesta]         = useState(defaultPropuesta)
  const [propuestaConfirmada, setPropuestaConfirmada] = useState(!!defaultPropuesta)
  const boxRef = useRef<HTMLDivElement>(null)

  // Cerrar el dropdown al hacer click afuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function notify(nextSelected: string[], nextPropuesta: string) {
    onChange?.(nextSelected, nextPropuesta)
  }

  const lleno = selected.length >= max

  // Opciones filtradas por búsqueda, excluyendo las ya elegidas
  const filtradas = oficiosDisponibles.filter(
    (o) => !selected.includes(o) && o.toLowerCase().includes(query.trim().toLowerCase())
  )

  function agregar(oficio: string) {
    if (lleno || selected.includes(oficio)) return
    const next = [...selected, oficio]
    setSelected(next)
    setQuery('')
    setOpen(false)
    notify(next, propuestaModo ? propuesta : '')
  }

  function quitar(oficio: string) {
    const next = selected.filter((o) => o !== oficio)
    setSelected(next)
    notify(next, propuestaModo ? propuesta : '')
  }

  function togglePropuestaModo() {
    const activar = !propuestaModo
    setPropuestaModo(activar)
    setPropuestaConfirmada(false)
    let next = selected
    // Lo que el prestador escribió en el buscador se traslada al campo de
    // propuesta, así no tiene que reescribirlo (y no queda vacío por error).
    let nuevaPropuesta = propuesta
    if (activar) {
      if (!propuesta.trim() && query.trim()) {
        nuevaPropuesta = query.trim().slice(0, 60)
        setPropuesta(nuevaPropuesta)
      }
      setQuery('')
      setOpen(false)
      if (!selected.includes('Otro') && selected.length < max) {
        next = [...selected, 'Otro']
        setSelected(next)
      }
    } else {
      next = selected.filter((o) => o !== 'Otro')
      setSelected(next)
      setPropuesta('')
      nuevaPropuesta = ''
    }
    notify(next, activar ? nuevaPropuesta : '')
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

      {/* Chips de oficios seleccionados */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((o, i) => {
            const esPrimero = i === 0
            return (
              <span
                key={o}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                  esPrimero
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-primary-container bg-surface-low text-primary-container'
                }`}
              >
                {o}
                {esPrimero && <span className="text-xs opacity-70">(principal)</span>}
                <button
                  type="button"
                  onClick={() => quitar(o)}
                  aria-label={`Quitar ${o}`}
                  className="ml-0.5 text-base leading-none opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Buscador desplegable */}
      <div ref={boxRef} className="relative">
        <input
          type="text"
          value={query}
          disabled={lleno}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={lleno ? `Máximo ${max} oficios` : 'Buscá y elegí tu oficio…'}
          className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container disabled:bg-surface-low disabled:text-outline disabled:cursor-not-allowed"
        />

        {open && !lleno && (
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-outline-variant bg-white shadow-card-hover">
            {filtradas.length > 0 ? (
              filtradas.map((o) => (
                <li key={o}>
                  <button
                    type="button"
                    onClick={() => agregar(o)}
                    className="block w-full px-3 py-2.5 text-left text-sm text-on-surface hover:bg-surface-low"
                  >
                    {o}
                  </button>
                </li>
              ))
            ) : query.trim() && !propuestaModo ? (
              <li>
                <button
                  type="button"
                  onClick={togglePropuestaModo}
                  className="block w-full px-3 py-2.5 text-left text-sm text-primary-container hover:bg-surface-low"
                >
                  No está en la lista. <strong>Proponer &ldquo;{query.trim()}&rdquo;</strong> →
                </button>
              </li>
            ) : (
              <li className="px-3 py-2.5 text-sm text-outline italic">
                Escribí para buscar tu oficio.
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Botón para activar modo propuesta */}
      <button
        type="button"
        onClick={togglePropuestaModo}
        className={`min-h-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition
          ${propuestaModo
            ? 'border-secondary-container bg-secondary-container text-on-secondary-container'
            : 'border-dashed border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
          }`}
      >
        {propuestaModo ? '✕ Cancelar propuesta' : '+ Mi oficio no está en la lista'}
      </button>

      {/* Campo de propuesta */}
      {propuestaModo && (
        <div className="rounded-lg border border-secondary-container bg-surface-low p-3 space-y-2">
          {propuestaConfirmada ? (
            <div className="rounded-lg bg-secondary/10 border border-secondary/30 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-secondary flex items-center gap-1">
                    <span className="text-base">✓</span>
                    Propuesta lista
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
                <strong>Importante:</strong> la propuesta se envía al admin recién cuando guardes el formulario
                (botón al final de la página). Después será revisada en menos de 48 horas; tu perfil se mostrará
                como <strong>Otro</strong> hasta que se apruebe.
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
                      ✓ Confirmar propuesta
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-outline">El primer oficio que selecciones será el principal.</p>

      {/* Hidden inputs para el formulario (solo si no es suprimido por el parent) */}
      {!suppressHiddenInputs && (
        <>
          <input type="hidden" name="oficios_json" value={JSON.stringify(selected)} />
          {propuestaModo && propuesta.trim() && (
            <input type="hidden" name="oficio_propuesto" value={propuesta.trim()} />
          )}
        </>
      )}
    </div>
  )
}
