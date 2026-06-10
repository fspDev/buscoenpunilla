-- ============================================================
-- BUSCO — Migración faltante: propuestas de oficio + notificaciones
-- Aplicar en Supabase Dashboard → SQL Editor
--
-- Contiene SOLO lo que falta en producción (verificado 10-jun-2026):
--   · Columnas oficio_propuesto / estado_oficio / oficio_fusionado
--   · Tabla notificaciones con RLS
--   · Trigger handle_new_user actualizado
--
-- NO re-siembra la tabla oficios (ya existe con los nombres correctos:
-- Electricidad, Plomería, etc. — el seed viejo usaba Electricista, Plomero).
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. NUEVAS COLUMNAS EN PRESTADORES
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

DROP POLICY IF EXISTS "notificaciones: propias" ON notificaciones;
CREATE POLICY "notificaciones: propias"
  ON notificaciones FOR ALL
  USING (auth.uid() = user_id);

GRANT ALL ON notificaciones TO service_role;
GRANT SELECT ON notificaciones TO authenticated;


-- ════════════════════════════════════════════════════════════
-- 3. ACTUALIZAR TRIGGER handle_new_user
-- Para que el registro de prestador soporte oficio_propuesto
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
