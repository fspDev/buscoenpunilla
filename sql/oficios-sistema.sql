-- ============================================================
-- BUSCO — Sistema híbrido de oficios
-- Aplicar en Supabase Dashboard → SQL Editor
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. TABLA DE OFICIOS (lista dinámica)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS oficios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT UNIQUE NOT NULL,
  activo     BOOLEAN NOT NULL DEFAULT TRUE,
  es_base    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Oficios base (solo inserta si no existen)
INSERT INTO oficios (nombre, es_base) VALUES
  ('Electricista',     true),
  ('Plomero',          true),
  ('Gasista',          true),
  ('Albañil',          true),
  ('Carpintero',       true),
  ('Techista',         true),
  ('Pintor',           true),
  ('Jardinero',        true),
  ('Cerrajero',        true),
  ('Herrero',          true),
  ('Soldador',         true),
  ('Fumigador',        true),
  ('Climatización/AC', true),
  ('Mudanzas',         true),
  ('Otro',             true)
ON CONFLICT (nombre) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- 2. NUEVAS COLUMNAS EN PRESTADORES
-- ════════════════════════════════════════════════════════════
ALTER TABLE prestadores
  ADD COLUMN IF NOT EXISTS oficio_propuesto TEXT,
  ADD COLUMN IF NOT EXISTS estado_oficio    TEXT NOT NULL DEFAULT 'aprobado'
    CHECK (estado_oficio IN ('aprobado', 'pendiente', 'rechazado', 'fusionado')),
  ADD COLUMN IF NOT EXISTS oficio_fusionado TEXT;

-- Marcar registros existentes como aprobados
UPDATE prestadores
  SET estado_oficio = 'aprobado'
  WHERE estado_oficio IS NULL OR estado_oficio = '';


-- ════════════════════════════════════════════════════════════
-- 3. TABLA DE NOTIFICACIONES
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notificaciones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL,
  mensaje    TEXT NOT NULL,
  leida      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ════════════════════════════════════════════════════════════
-- 4. ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════
ALTER TABLE oficios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- oficios: lectura pública de activos
DROP POLICY IF EXISTS "oficios: lectura activos" ON oficios;
CREATE POLICY "oficios: lectura activos"
  ON oficios FOR SELECT
  USING (activo = TRUE);

-- oficios: admin puede gestionar (INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "oficios: gestión admin" ON oficios;
CREATE POLICY "oficios: gestión admin"
  ON oficios FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- notificaciones: cada usuario gestiona las suyas
DROP POLICY IF EXISTS "notificaciones: propias" ON notificaciones;
CREATE POLICY "notificaciones: propias"
  ON notificaciones FOR ALL
  USING (auth.uid() = user_id);


-- ════════════════════════════════════════════════════════════
-- 5. PERMISOS SERVICE ROLE
-- ════════════════════════════════════════════════════════════
GRANT ALL ON oficios        TO service_role;
GRANT ALL ON notificaciones TO service_role;
GRANT SELECT ON oficios TO anon, authenticated;
GRANT SELECT ON notificaciones TO authenticated;


-- ════════════════════════════════════════════════════════════
-- 6. ACTUALIZAR TRIGGER handle_new_user
-- Para soportar oficio_propuesto y estado_oficio
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
