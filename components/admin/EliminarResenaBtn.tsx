'use client'

import { ConfirmDialog } from './ConfirmDialog'
import { eliminarResenaAdmin } from '@/app/actions/admin'

export function EliminarResenaBtn({ resenaId }: { resenaId: string }) {
  return (
    <ConfirmDialog
      label="Eliminar"
      mensaje="¿Eliminar esta reseña? El rating del prestador se recalculará."
      onConfirm={() => eliminarResenaAdmin(resenaId)}
    />
  )
}
