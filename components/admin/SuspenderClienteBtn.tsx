'use client'

import { ConfirmDialog } from './ConfirmDialog'
import { eliminarClienteAdmin } from '@/app/actions/admin'

export function SuspenderClienteBtn({ id, nombre }: { id: string; nombre: string | null }) {
  return (
    <ConfirmDialog
      label="Eliminar cuenta"
      mensaje={`¿Eliminar la cuenta de ${nombre ?? 'este cliente'}? Esta acción es permanente e irreversible.`}
      onConfirm={() => eliminarClienteAdmin(id)}
      variant="warning"
      labelClass="text-on-surface-variant hover:text-ds-error hover:underline text-xs"
    />
  )
}
