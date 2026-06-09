-- ============================================================
-- BUSCO — Fix RLS para vista prestadores_publicos
-- La vista usa security_invoker=true, por lo que necesita
-- que la tabla profiles sea legible por todos (no solo el dueño).
-- Ejecutar en SQL Editor del dashboard de Supabase (Role: postgres)
-- ============================================================

-- 1. Diagnóstico — muestra las políticas actuales de profiles
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 2. Diagnóstico — conteo directo sin RLS (debe mostrar 20)
SELECT COUNT(*) FROM public.prestadores WHERE activo = true;

-- 3. Fix: permitir lectura pública de perfiles
--    (necesario para que la vista pueda hacer el JOIN)
DROP POLICY IF EXISTS "profiles: leer público" ON public.profiles;

CREATE POLICY "profiles: leer público"
  ON public.profiles FOR SELECT
  USING (true);

-- 4. Verificación — debe devolver 20 filas ahora
SELECT COUNT(*) FROM public.prestadores_publicos;
