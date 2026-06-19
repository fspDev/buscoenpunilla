-- ============================================================
-- BUSCO — Fix: vista admin_clientes
-- Problema: la vista anterior usaba security_invoker o un JOIN
-- a auth.users que fallaba según el cliente Supabase utilizado.
-- Solución: vista SECURITY DEFINER (sin security_invoker) que
-- corre como postgres y puede acceder auth.users directamente.
-- Ejecutar en: Supabase Dashboard → SQL Editor (Role: postgres)
-- ============================================================

DROP VIEW IF EXISTS public.admin_clientes;

CREATE VIEW public.admin_clientes AS
SELECT
  pr.id,
  pr.nombre,
  au.email::text                   AS email,
  pr.localidad,
  pr.whatsapp,
  pr.created_at,
  COUNT(DISTINCT r.id)::int        AS total_resenas,
  COUNT(DISTINCT cl.id)::int       AS total_contactos
FROM public.profiles pr
JOIN auth.users au ON au.id = pr.id
LEFT JOIN public.resenas r  ON r.cliente_id  = pr.id
LEFT JOIN public.contactos_log cl ON cl.cliente_id = pr.id
WHERE pr.role = 'cliente'
GROUP BY pr.id, pr.nombre, au.email, pr.localidad, pr.whatsapp, pr.created_at;

-- Restringir acceso: solo service_role y authenticated (no anon)
REVOKE SELECT ON public.admin_clientes FROM anon;
GRANT  SELECT ON public.admin_clientes TO authenticated;
GRANT  SELECT ON public.admin_clientes TO service_role;

-- Verificación: debe mostrar los clientes registrados
SELECT * FROM public.admin_clientes;
