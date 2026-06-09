// Tipos generados manualmente — reemplazar con los de Supabase CLI cuando esté conectado

export type Role = 'cliente' | 'prestador' | 'admin'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; role: Role; nombre: string | null
          whatsapp: string | null; localidad: string | null
          foto_url: string | null; created_at: string
        }
        Insert: {
          id: string; role?: Role; nombre?: string | null
          whatsapp?: string | null; localidad?: string | null
          foto_url?: string | null; created_at?: string
        }
        Update: {
          id?: string; role?: Role; nombre?: string | null
          whatsapp?: string | null; localidad?: string | null
          foto_url?: string | null; created_at?: string
        }
        Relationships: []
      }
      mensajes_contacto: {
        Row: {
          id: string; nombre: string; email: string; tipo: string
          mensaje: string; leido: boolean; user_id: string | null; created_at: string
        }
        Insert: {
          id?: string; nombre: string; email: string; tipo: string
          mensaje: string; leido?: boolean; user_id?: string | null; created_at?: string
        }
        Update: {
          id?: string; nombre?: string; email?: string; tipo?: string
          mensaje?: string; leido?: boolean; user_id?: string | null; created_at?: string
        }
        Relationships: []
      }
      prestadores: {
        Row: {
          id: string; oficio: string | null; oficios: string[] | null
          descripcion: string | null; foto_url: string | null
          zonas_trabajo: string[] | null; activo: boolean
          verificado: boolean; suspendido: boolean
          notas_admin: string | null; fecha_fin_gratuito: string | null
          matricula: string | null
          created_at: string
        }
        Insert: {
          id: string; oficio?: string | null; oficios?: string[] | null
          descripcion?: string | null; foto_url?: string | null
          zonas_trabajo?: string[] | null; activo?: boolean
          verificado?: boolean; suspendido?: boolean
          notas_admin?: string | null; fecha_fin_gratuito?: string | null
          matricula?: string | null
          created_at?: string
        }
        Update: {
          id?: string; oficio?: string | null; oficios?: string[] | null
          descripcion?: string | null; foto_url?: string | null
          zonas_trabajo?: string[] | null; activo?: boolean
          verificado?: boolean; suspendido?: boolean
          notas_admin?: string | null; fecha_fin_gratuito?: string | null
          matricula?: string | null
          created_at?: string
        }
        Relationships: []
      }
      resenas: {
        Row: {
          id: string
          prestador_id: string
          cliente_id: string
          estrellas: number
          comentario: string | null
          respuesta_prestador: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prestador_id: string
          cliente_id: string
          estrellas: number
          comentario?: string | null
          respuesta_prestador?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prestador_id?: string
          cliente_id?: string
          estrellas?: number
          comentario?: string | null
          respuesta_prestador?: string | null
          created_at?: string
        }
        Relationships: []
      }
      fotos_trabajos: {
        Row: {
          id: string
          prestador_id: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          prestador_id: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          prestador_id?: string
          url?: string
          created_at?: string
        }
        Relationships: []
      }
      auditoria_admin: {
        Row: {
          id: string; admin_id: string; accion: string
          entidad_id: string | null; detalle: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string; admin_id: string; accion: string
          entidad_id?: string | null; detalle?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string; admin_id?: string; accion?: string
          entidad_id?: string | null; detalle?: Record<string, unknown> | null
          created_at?: string
        }
        Relationships: []
      }
      impresiones_busqueda: {
        Row: {
          id: string
          prestador_id: string
          oficio_buscado: string | null
          zona_buscada: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prestador_id: string
          oficio_buscado?: string | null
          zona_buscada?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prestador_id?: string
          oficio_buscado?: string | null
          zona_buscada?: string | null
          created_at?: string
        }
        Relationships: []
      }
      reportes_resenas: {
        Row: {
          id: string; resena_id: string; reportado_por: string
          motivo: string; created_at: string
          resuelto: boolean; resuelto_at: string | null
        }
        Insert: {
          id?: string; resena_id: string; reportado_por: string
          motivo: string; created_at?: string
          resuelto?: boolean; resuelto_at?: string | null
        }
        Update: {
          id?: string; resena_id?: string; reportado_por?: string
          motivo?: string; created_at?: string
          resuelto?: boolean; resuelto_at?: string | null
        }
        Relationships: []
      }
      contactos_log: {
        Row: {
          id: string
          prestador_id: string
          cliente_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          prestador_id: string
          cliente_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          prestador_id?: string
          cliente_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      prestadores_publicos: {
        Row: {
          id: string; nombre: string; oficio: string | null
          oficios: string[] | null
          descripcion: string | null; foto_url: string | null
          zonas_trabajo: string[] | null; whatsapp: string | null
          rating_promedio: number; total_resenas: number
          matricula: string | null
        }
        Relationships: []
      }
      admin_prestadores: {
        Row: {
          id: string; nombre: string; whatsapp: string | null
          oficio: string | null; oficios: string[] | null; zonas_trabajo: string[] | null
          activo: boolean; verificado: boolean; suspendido: boolean
          foto_url: string | null; descripcion: string | null
          notas_admin: string | null; fecha_fin_gratuito: string | null
          matricula: string | null
          created_at: string; rating_promedio: number; total_resenas: number
          ultimo_contacto: string | null
        }
        Relationships: []
      }
      admin_clientes: {
        Row: {
          id: string; nombre: string | null; email: string
          localidad: string | null; whatsapp: string | null
          created_at: string; total_resenas: number; total_contactos: number
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      role: Role
    }
    CompositeTypes: Record<string, never>
  }
}
