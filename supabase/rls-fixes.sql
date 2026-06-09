-- ============================================================
-- BUSCO — Corrección de Políticas RLS para profiles
-- Ejecutar en el SQL Editor del dashboard de Supabase (Role: postgres)
-- ============================================================

-- 1. Eliminar la política select restrictiva actual
DROP POLICY IF EXISTS "profiles: leer propio" ON public.profiles;

-- 2. Permitir que cualquier usuario (autenticado o anónimo) pueda leer
-- campos públicos de los perfiles (necesario para el buscador y reseñas)
CREATE POLICY "profiles: leer público"
  ON public.profiles FOR SELECT
  USING (true);

-- 3. Asegurar que los usuarios solo puedan editar su propio perfil
DROP POLICY IF EXISTS "profiles: editar propio" ON public.profiles;

CREATE POLICY "profiles: editar propio"
  ON public.profiles FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
