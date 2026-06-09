'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface Props {
  bucket: string
  path_prefix: string
  onUploadComplete: (url: string) => void
  label?: string
}

const TIPOS_VALIDOS  = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES      = 5 * 1024 * 1024 // 5 MB

export function FotoUploader({ bucket, path_prefix, onUploadComplete, label = 'Agregar foto' }: Props) {
  const inputRef             = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError]    = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (!TIPOS_VALIDOS.includes(file.type)) {
      setError('Solo se aceptan imágenes JPG, PNG o WebP.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('El archivo supera el límite de 5 MB.')
      return
    }

    // Preview local
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleUpload() {
    if (!inputRef.current?.files?.[0]) return
    const file = inputRef.current.files[0]
    const ext  = file.name.split('.').pop()
    const path = `${path_prefix}-${Date.now()}.${ext}`

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (uploadError || !data) {
      setError('No se pudo subir la imagen. Intentá de nuevo.')
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)

    onUploadComplete(publicUrl)
    setPreview(null)
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleCancel() {
    setPreview(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleSelect}
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-dashed border-outline-variant px-4 py-2 text-sm text-on-surface-variant transition hover:border-primary-container hover:text-primary-container"
        >
          <span className="text-lg">+</span>
          {label}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-outline-variant">
            <Image src={preview} alt="Preview" fill className="object-cover" sizes="128px" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="rounded-lg bg-primary-container px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Subiendo...' : 'Confirmar'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs text-on-surface-variant transition hover:bg-surface-low"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-ds-error">{error}</p>}
    </div>
  )
}
