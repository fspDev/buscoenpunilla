-- ============================================================
-- BUSCO — Optimización integral de la base (10-jun-2026)
-- Aplicar en Supabase Dashboard → SQL Editor
--
-- Incluye:
--   1. Migración faltante: columnas de propuesta de oficio,
--      tabla notificaciones, trigger handle_new_user
--   2. Limpieza de políticas RLS duplicadas/conflictivas
--      (re-creadas con (SELECT auth.uid()) para mejor plan)
--   3. Índices para las consultas frecuentes de la app
--
-- Es idempotente: correrlo dos veces no rompe nada.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. COLUMNAS DE PROPUESTA DE OFICIO
-- ════════════════════════════════════════════════════════════
ALTER TABLE prestadores
  ADD COLUMN IF NOT EXISTS oficio_propuesto TEXT,
  ADD COLUMN IF NOT EXISTS estado_oficio    TEXT NOT NULL DEFAULT 'aprobado'
    CHECK (estado_oficio IN ('aprobado', 'pendiente', 'rechazado', 'fusionado')),
  ADD COLUMN IF NOT EXISTS oficio_fusionado TEXT;


-- ════════════════════════════════════════════════════════════
-- 2. TABLA DE NOTIFICACIONES
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notificaciones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL,
  mensaje    TEXT NOT NULL,
  leida      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
GRANT ALL ON notificaciones TO service_role;
GRANT SELECT ON notificaciones TO authenticated;


-- ════════════════════════════════════════════════════════════
-- 3. TRIGGER handle_new_user (con soporte de oficio_propuesto)
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, nombre, whatsapp, localidad)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente'),
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'localidad'
  )
  ON CONFLICT (id) DO NOTHING;

  IF (NEW.raw_user_meta_data->>'role') = 'prestador' THEN
    INSERT INTO public.prestadores (
      id, oficio, oficios, descripcion, zonas_trabajo,
      oficio_propuesto, estado_oficio, fecha_fin_gratuito
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'oficio', 'Otro'),
      CASE
        WHEN NEW.raw_user_meta_data->>'oficios' IS NOT NULL
        THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'oficios'))
        ELSE ARRAY[COALESCE(NEW.raw_user_meta_data->>'oficio', 'Otro')]
      END,
      NEW.raw_user_meta_data->>'descripcion',
      ARRAY[NEW.raw_user_meta_data->>'localidad'],
      NEW.raw_user_meta_data->>'oficio_propuesto',
      CASE
        WHEN NEW.raw_user_meta_data->>'oficio_propuesto' IS NOT NULL
          AND NEW.raw_user_meta_data->>'oficio_propuesto' != ''
        THEN 'pendiente'
        ELSE 'aprobado'
      END,
      NOW() + INTERVAL '60 days'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ════════════════════════════════════════════════════════════
-- 4. LIMPIEZA TOTAL DE POLÍTICAS RLS
-- Borra TODAS las políticas de public (había duplicadas, con
-- nombres corruptos por encoding, y una conflictiva que exponía
-- prestadores suspendidos) y las re-crea canónicas.
-- ════════════════════════════════════════════════════════════
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ── profiles ──────────────────────────────────────────────
-- Lectura pública: la vista prestadores_publicos (security
-- invoker) necesita JOIN con profiles desde anon.
CREATE POLICY "profiles select publico"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles update propio"
  ON profiles FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- ── prestadores ───────────────────────────────────────────
-- Una sola política de SELECT: público si activo y NO suspendido
-- (la política vieja ignoraba suspendido), o el dueño siempre.
CREATE POLICY "prestadores select publico o propio"
  ON prestadores FOR SELECT
  USING ((activo = TRUE AND suspendido = FALSE) OR id = (SELECT auth.uid()));

CREATE POLICY "prestadores insert propio"
  ON prestadores FOR INSERT
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "prestadores update propio"
  ON prestadores FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- ── resenas ───────────────────────────────────────────────
CREATE POLICY "resenas select publico"
  ON resenas FOR SELECT
  USING (true);

CREATE POLICY "resenas insert cliente"
  ON resenas FOR INSERT
  WITH CHECK (cliente_id = (SELECT auth.uid()));

CREATE POLICY "resenas update prestador responde"
  ON resenas FOR UPDATE
  USING (prestador_id = (SELECT auth.uid()));

-- ── fotos_trabajos ────────────────────────────────────────
CREATE POLICY "fotos select publico"
  ON fotos_trabajos FOR SELECT
  USING (true);

CREATE POLICY "fotos insert propio"
  ON fotos_trabajos FOR INSERT
  WITH CHECK (prestador_id = (SELECT auth.uid()));

CREATE POLICY "fotos delete propio"
  ON fotos_trabajos FOR DELETE
  USING (prestador_id = (SELECT auth.uid()));

-- ── contactos_log ─────────────────────────────────────────
CREATE POLICY "contactos insert publico"
  ON contactos_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "contactos select propio o admin"
  ON contactos_log FOR SELECT
  USING (
    prestador_id = (SELECT auth.uid())
    OR cliente_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

-- ── impresiones_busqueda ──────────────────────────────────
CREATE POLICY "impresiones insert publico"
  ON impresiones_busqueda FOR INSERT
  WITH CHECK (true);

CREATE POLICY "impresiones select propio o admin"
  ON impresiones_busqueda FOR SELECT
  USING (
    prestador_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

-- ── mensajes_contacto ─────────────────────────────────────
CREATE POLICY "mensajes insert publico"
  ON mensajes_contacto FOR INSERT
  WITH CHECK (true);

CREATE POLICY "mensajes gestion admin"
  ON mensajes_contacto FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- ── reportes_resenas ──────────────────────────────────────
CREATE POLICY "reportes insert propio"
  ON reportes_resenas FOR INSERT
  WITH CHECK (reportado_por = (SELECT auth.uid()));

CREATE POLICY "reportes select admin"
  ON reportes_resenas FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- ── auditoria_admin ───────────────────────────────────────
CREATE POLICY "auditoria solo admin"
  ON auditoria_admin FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- ── oficios ───────────────────────────────────────────────
CREATE POLICY "oficios select activos"
  ON oficios FOR SELECT
  USING (activo = TRUE);

CREATE POLICY "oficios gestion admin"
  ON oficios FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role = 'admin'));

-- ── notificaciones ────────────────────────────────────────
CREATE POLICY "notificaciones propias"
  ON notificaciones FOR ALL
  USING (user_id = (SELECT auth.uid()));


-- ════════════════════════════════════════════════════════════
-- 5. ÍNDICES (no existía ninguno fuera de PK/unique)
-- ════════════════════════════════════════════════════════════

-- Reseñas por cliente (perfil del cliente, panel admin)
CREATE INDEX IF NOT EXISTS idx_resenas_cliente
  ON resenas (cliente_id);

-- Fotos del perfil del prestador
CREATE INDEX IF NOT EXISTS idx_fotos_prestador
  ON fotos_trabajos (prestador_id);

-- Contactos: métricas del dashboard del prestador y del admin
CREATE INDEX IF NOT EXISTS idx_contactos_prestador_fecha
  ON contactos_log (prestador_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contactos_cliente
  ON contactos_log (cliente_id);

-- Impresiones: métricas
CREATE INDEX IF NOT EXISTS idx_impresiones_prestador_fecha
  ON impresiones_busqueda (prestador_id, created_at DESC);

-- Búsqueda por oficio y zona (arrays → GIN)
CREATE INDEX IF NOT EXISTS idx_prestadores_oficios
  ON prestadores USING gin (oficios);
CREATE INDEX IF NOT EXISTS idx_prestadores_zonas
  ON prestadores USING gin (zonas_trabajo);

-- Propuestas pendientes (panel admin / badge del menú)
CREATE INDEX IF NOT EXISTS idx_prestadores_estado_oficio
  ON prestadores (estado_oficio) WHERE estado_oficio = 'pendiente';

-- Notificaciones del usuario, más recientes primero
CREATE INDEX IF NOT EXISTS idx_notificaciones_user
  ON notificaciones (user_id, created_at DESC);

-- Mensajes de contacto sin leer (bandeja del admin)
CREATE INDEX IF NOT EXISTS idx_mensajes_no_leidos
  ON mensajes_contacto (created_at DESC) WHERE leido = FALSE;

-- Auditoría ordenada por fecha
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha
  ON auditoria_admin (created_at DESC);


-- ════════════════════════════════════════════════════════════
-- 6. LIMPIEZA: función temporal de introspección
-- ════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS public.inventario_db();


-- ════════════════════════════════════════════════════════════
-- 7. VERIFICACIÓN — resumen final
-- ════════════════════════════════════════════════════════════
SELECT 'politicas' AS objeto, COUNT(*)::TEXT AS total FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 'indices secundarios', COUNT(*)::TEXT FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%'
UNION ALL
SELECT 'col oficio_propuesto', COUNT(*)::TEXT FROM information_schema.columns
  WHERE table_name = 'prestadores' AND column_name = 'oficio_propuesto'
UNION ALL
SELECT 'tabla notificaciones', COUNT(*)::TEXT FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'notificaciones';
