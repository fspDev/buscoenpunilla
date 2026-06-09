-- ============================================================
-- BUSCO — Reseñas públicas (sin login)
-- Aplicar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Hacer cliente_id nullable para reseñas sin cuenta
ALTER TABLE resenas ALTER COLUMN cliente_id DROP NOT NULL;

-- 2. Columna para nombre del cliente anónimo
ALTER TABLE resenas
  ADD COLUMN IF NOT EXISTS cliente_nombre TEXT;

-- 3. Columna email para deduplicación
ALTER TABLE resenas
  ADD COLUMN IF NOT EXISTS cliente_email TEXT;

-- 4. Constraint: un mismo email no puede dejar más de una reseña al mismo prestador
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'resenas_prestador_id_cliente_email_key'
  ) THEN
    ALTER TABLE resenas
      ADD CONSTRAINT resenas_prestador_id_cliente_email_key
      UNIQUE (prestador_id, cliente_email);
  END IF;
END $$;

-- 5. Las inserciones públicas se hacen vía server action con service_role,
--    que bypasa RLS. No se necesita política extra.
