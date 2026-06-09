-- ============================================================
-- BUSCO — Crear tabla oficios + seed de oficios base
-- Ejecutar en SQL Editor del dashboard de Supabase (Role: postgres)
-- ============================================================

-- 1. Crear tabla si no existe
CREATE TABLE IF NOT EXISTS public.oficios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT UNIQUE NOT NULL,
  activo     BOOLEAN NOT NULL DEFAULT TRUE,
  es_base    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RLS
ALTER TABLE public.oficios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "oficios: lectura activos" ON public.oficios;
CREATE POLICY "oficios: lectura activos"
  ON public.oficios FOR SELECT
  USING (activo = TRUE);

DROP POLICY IF EXISTS "oficios: gestión admin" ON public.oficios;
CREATE POLICY "oficios: gestión admin"
  ON public.oficios FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Permisos
GRANT ALL ON public.oficios TO service_role;
GRANT SELECT ON public.oficios TO anon, authenticated;

-- 4. Oficios base
INSERT INTO public.oficios (nombre, es_base) VALUES
  ('Electricidad',     true),
  ('Plomería',         true),
  ('Gasista',          true),
  ('Albañilería',      true),
  ('Carpintería',      true),
  ('Techado',          true),
  ('Pintura',          true),
  ('Jardinería',       true),
  ('Cerrajería',       true),
  ('Herrería',         true),
  ('Soldadura',        true),
  ('Fumigación',       true),
  ('Climatización/AC', true),
  ('Mudanzas',         true),
  ('Otro',             true)
ON CONFLICT (nombre) DO NOTHING;
