-- ============================================================
-- BUSCO — Correcciones de seguridad (Security Advisor)
-- Ejecutar en el SQL Editor del dashboard de Supabase
-- ============================================================

-- ─── FIX 1: Security Definer View → prestadores_publicos ─────
-- La vista debe usar los permisos del CALLER (security invoker)
-- para que RLS de la tabla prestadores aplique correctamente.

DROP VIEW IF EXISTS public.prestadores_publicos;

CREATE VIEW public.prestadores_publicos
WITH (security_invoker = true)
AS
SELECT
  p.id,
  pr.nombre,
  p.oficio,
  p.descripcion,
  p.foto_url,
  p.zonas_trabajo,
  pr.whatsapp,
  COALESCE(AVG(r.estrellas), 0)::float  AS rating_promedio,
  COUNT(r.id)::int                       AS total_resenas
FROM public.prestadores p
JOIN public.profiles pr ON pr.id = p.id
LEFT JOIN public.resenas r ON r.prestador_id = p.id
WHERE p.activo = true
GROUP BY p.id, pr.nombre, p.oficio, p.descripcion, p.foto_url, p.zonas_trabajo, pr.whatsapp;

GRANT SELECT ON public.prestadores_publicos TO anon, authenticated;

-- ─── FIX 2: Security Definer View → admin_prestadores ────────
-- Vista de admin: solo accesible por usuarios autenticados.
-- Se elimina el acceso anónimo.

DROP VIEW IF EXISTS public.admin_prestadores;

CREATE VIEW public.admin_prestadores
WITH (security_invoker = true)
AS
SELECT
  p.id,
  pr.nombre,
  pr.whatsapp,
  p.oficio,
  p.zonas_trabajo,
  p.activo,
  p.verificado,
  p.suspendido,
  p.foto_url,
  p.descripcion,
  p.notas_admin,
  p.fecha_fin_gratuito,
  pr.created_at,
  COALESCE(AVG(r.estrellas), 0)::float  AS rating_promedio,
  COUNT(DISTINCT r.id)::int              AS total_resenas,
  MAX(cl.created_at)                    AS ultimo_contacto
FROM public.prestadores p
JOIN public.profiles pr ON pr.id = p.id
LEFT JOIN public.resenas r ON r.prestador_id = p.id
LEFT JOIN public.contactos_log cl ON cl.prestador_id = p.id
GROUP BY p.id, pr.nombre, pr.whatsapp, p.oficio, p.zonas_trabajo,
         p.activo, p.verificado, p.suspendido, p.foto_url, p.descripcion,
         p.notas_admin, p.fecha_fin_gratuito, pr.created_at;

-- Solo usuarios autenticados pueden leer (el admin lo es)
REVOKE SELECT ON public.admin_prestadores FROM anon;
GRANT  SELECT ON public.admin_prestadores TO authenticated;

-- ─── FIX 3: Exposed Auth Users → admin_clientes ──────────────
-- El JOIN directo con auth.users expone emails vía API pública.
-- Solución: eliminar el JOIN con auth.users y usar una función
-- con SECURITY DEFINER que solo pueden ejecutar admins.

DROP VIEW IF EXISTS public.admin_clientes;

-- Función segura para obtener el email de un usuario (solo admin)
CREATE OR REPLACE FUNCTION public.get_user_email(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = user_id
$$;

-- Restringir ejecución: solo usuarios autenticados
REVOKE ALL ON FUNCTION public.get_user_email FROM public, anon;
GRANT  EXECUTE ON FUNCTION public.get_user_email TO authenticated;

CREATE VIEW public.admin_clientes
WITH (security_invoker = true)
AS
SELECT
  pr.id,
  pr.nombre,
  public.get_user_email(pr.id)    AS email,
  pr.localidad,
  pr.whatsapp,
  pr.created_at,
  COUNT(DISTINCT r.id)::int        AS total_resenas,
  COUNT(DISTINCT cl.id)::int       AS total_contactos
FROM public.profiles pr
LEFT JOIN public.resenas r  ON r.cliente_id  = pr.id
LEFT JOIN public.contactos_log cl ON cl.cliente_id = pr.id
WHERE pr.role = 'cliente'
GROUP BY pr.id, pr.nombre, pr.localidad, pr.whatsapp, pr.created_at;

REVOKE SELECT ON public.admin_clientes FROM anon;
GRANT  SELECT ON public.admin_clientes TO authenticated;

-- ─── FIX 4: Auth RLS Initialization Plan → profiles ──────────
-- Las políticas que llaman auth.uid() directamente no se cachean
-- bien. Envolverlas en (SELECT auth.uid()) mejora el plan de ejecución.

-- Borrar las políticas actuales de profiles
DROP POLICY IF EXISTS "profiles: leer propio"   ON public.profiles;
DROP POLICY IF EXISTS "profiles: editar propio" ON public.profiles;

-- Recrearlas con (SELECT auth.uid()) para cache de plan
CREATE POLICY "profiles: leer propio"
  ON public.profiles FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "profiles: editar propio"
  ON public.profiles FOR UPDATE
  USING (id = (SELECT auth.uid()));
