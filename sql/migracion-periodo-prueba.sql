-- ============================================================
-- MIGRACIÓN: período de prueba de 60 días
-- Aplicar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Establece el default de fecha_fin_gratuito en 60 días desde el registro
ALTER TABLE prestadores
  ALTER COLUMN fecha_fin_gratuito SET DEFAULT (NOW() + INTERVAL '60 days');

-- 2. Completa los registros existentes que no tienen fecha asignada
UPDATE prestadores
  SET fecha_fin_gratuito = created_at + INTERVAL '60 days'
  WHERE fecha_fin_gratuito IS NULL;
