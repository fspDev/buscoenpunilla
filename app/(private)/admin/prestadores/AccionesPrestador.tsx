'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { toggleActivoPrestadorAdmin, eliminarPrestadorAdmin } from '@/app/actions/admin'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

interface Props {
  id: string
  nombre: string
  activo: boolean
}

export function AccionesPrestador({ id, nombre, activo }: Props) {
  const [isPending, start] = useTransition()

  function handleToggle() {
    start(() => toggleActivoPrestadorAdmin(id, !activo))
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <Link
        href={`/prestador/${id}`}
        target="_blank"
        className="text-primary-container hover:underline"
      >
        Ver ↗
      </Link>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`transition hover:underline disabled:opacity-50 ${activo ? 'text-ds-error' : 'text-secondary'}`}
      >
        {activo ? 'Pausar' : 'Activar'}
      </button>
      <Link href={`/admin/prestadores/${id}/editar`} className="text-on-surface-variant hover:underline">
        Editar
      </Link>
      <ConfirmDialog
        label="Eliminar"
        mensaje={`¿Eliminar a ${nombre}? Se eliminarán también todas sus reseñas y fotos. Esta acción no se puede deshacer.`}
        onConfirm={() => eliminarPrestadorAdmin(id)}
      />
    </div>
  )
}
