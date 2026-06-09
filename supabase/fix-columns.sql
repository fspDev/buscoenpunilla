-- ============================================================
-- BUSCO — Fix: columnas faltantes en prestadores
-- Ejecutar en el SQL Editor del dashboard de Supabase (Role: postgres)
-- Es seguro correrlo aunque las columnas ya existan (IF NOT EXISTS)
-- ============================================================

-- Agregadas en fase7.sql
ALTER TABLE public.prestadores ADD COLUMN IF NOT EXISTS oficios text[];

-- Migrar oficio → oficios[0] en registros sin oficios cargados
UPDATE public.prestadores
SET oficios = ARRAY[oficio]
WHERE oficio IS NOT NULL AND (oficios IS NULL OR oficios = '{}');

-- Agregada en fase8.sql
ALTER TABLE public.prestadores ADD COLUMN IF NOT EXISTS matricula text;

-- Confirmar columnas presentes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'prestadores'
ORDER BY ordinal_position;
