-- ============================================================
-- BUSCO — Fase 4: Reseñas y reputación
-- Ejecutar en el SQL Editor del dashboard de Supabase
-- ============================================================

-- ─── CONSTRAINTS anti-fraude en tabla resenas ────────────────
-- Un cliente solo puede dejar UNA reseña por prestador
ALTER TABLE public.resenas
  ADD CONSTRAINT resenas_unique_cliente_prestador
  UNIQUE (prestador_id, cliente_id);

-- Un prestador no puede reseñarse a sí mismo
ALTER TABLE public.resenas
  ADD CONSTRAINT resenas_no_self_review
  CHECK (cliente_id != prestador_id);

-- ─── RLS adicional: cliente puede leer sus propios contactos ─
-- Necesario para mostrar el botón "Dejar reseña" en el perfil
CREATE POLICY "contactos_log: leer propio cliente"
  ON public.contactos_log FOR SELECT
  USING (auth.uid() = cliente_id);

-- ─── TABLA: reportes_resenas ─────────────────────────────────
CREATE TABLE public.reportes_resenas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resena_id     uuid NOT NULL REFERENCES public.resenas(id) ON DELETE CASCADE,
  reportado_por uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  motivo        text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resena_id, reportado_por)
);

ALTER TABLE public.reportes_resenas ENABLE ROW LEVEL SECURITY;

-- Solo admin puede leer reportes
CREATE POLICY "reportes_resenas: leer admin"
  ON public.reportes_resenas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Usuarios autenticados pueden insertar (un reporte por reseña por usuario)
CREATE POLICY "reportes_resenas: insertar autenticado"
  ON public.reportes_resenas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = reportado_por);
