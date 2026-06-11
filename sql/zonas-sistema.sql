-- ============================================================
-- BUSCO — Sistema híbrido de zonas (espejo del de oficios)
-- Aplicar en Supabase Dashboard → SQL Editor
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. TABLA DE ZONAS (lista dinámica)
-- ════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS zonas (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     TEXT UNIQUE NOT NULL,
  activo     BOOLEAN NOT NULL DEFAULT TRUE,
  es_base    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Zonas base (solo inserta si no existen)
INSERT INTO zonas (nombre, es_base) VALUES
  ('San Antonio de Arredondo', true),
  ('Bialet Massé',             true),
  ('Mayu Sumaj',               true),
  ('Villa Parque Síquiman',    true),
  ('Villa Carlos Paz',         true),
  ('Cosquín',                  true),
  ('La Falda',                 true)
ON CONFLICT (nombre) DO NOTHING;


-- ════════════════════════════════════════════════════════════
-- 2. NUEVAS COLUMNAS EN PRESTADORES (propuesta de zona)
-- ════════════════════════════════════════════════════════════
ALTER TABLE prestadores
  ADD COLUMN IF NOT EXISTS zona_propuesta TEXT,
  ADD COLUMN IF NOT EXISTS estado_zona    TEXT NOT NULL DEFAULT 'aprobado'
    CHECK (estado_zona IN ('aprobado', 'pendiente', 'rechazado', 'fusionado'));

-- Marcar registros existentes como aprobados
UPDATE prestadores
  SET estado_zona = 'aprobado'
  WHERE estado_zona IS NULL OR estado_zona = '';


-- ════════════════════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════
ALTER TABLE zonas ENABLE ROW LEVEL SECURITY;

-- zonas: lectura pública de activas
DROP POLICY IF EXISTS "zonas: lectura activas" ON zonas;
CREATE POLICY "zonas: lectura activas"
  ON zonas FOR SELECT
  USING (activo = TRUE);

-- zonas: admin puede gestionar (INSERT/UPDATE/DELETE)
DROP POLICY IF EXISTS "zonas: gestión admin" ON zonas;
CREATE POLICY "zonas: gestión admin"
  ON zonas FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ════════════════════════════════════════════════════════════
-- 4. PERMISOS SERVICE ROLE
-- ════════════════════════════════════════════════════════════
GRANT ALL ON zonas TO service_role;
GRANT SELECT ON zonas TO anon, authenticated;
