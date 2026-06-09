-- ============================================================
-- BUSCO — Fase 8: Campos Extendidos de Prestador
-- Ejecutar en el SQL Editor del dashboard de Supabase (Role: postgres)
-- ============================================================

-- 1. Agregar columna matricula a la tabla prestadores
ALTER TABLE public.prestadores ADD COLUMN IF NOT EXISTS matricula text;

-- 2. Actualizar la vista prestadores_publicos para incluir la matrícula
DROP VIEW IF EXISTS public.prestadores_publicos;

CREATE VIEW public.prestadores_publicos
WITH (security_invoker = true)
AS
SELECT
  p.id,
  pr.nombre,
  pr.foto_url                             AS perfil_foto_url,
  p.oficio,
  p.oficios,
  p.descripcion,
  p.foto_url,
  p.zonas_trabajo,
  pr.whatsapp,
  p.matricula,
  COALESCE(AVG(r.estrellas), 0)::float   AS rating_promedio,
  COUNT(r.id)::int                        AS total_resenas
FROM public.prestadores p
JOIN public.profiles pr ON pr.id = p.id
LEFT JOIN public.resenas r ON r.prestador_id = p.id
WHERE p.activo = true
GROUP BY p.id, pr.nombre, pr.foto_url, p.oficio, p.oficios,
         p.descripcion, p.foto_url, p.zonas_trabajo, pr.whatsapp, p.matricula;

GRANT SELECT ON public.prestadores_publicos TO anon, authenticated;

-- 3. Actualizar la vista admin_prestadores para incluir la matrícula
DROP VIEW IF EXISTS public.admin_prestadores;

CREATE VIEW public.admin_prestadores
WITH (security_invoker = true)
AS
SELECT
  p.id, pr.nombre, pr.whatsapp,
  p.oficio, p.oficios, p.zonas_trabajo,
  p.activo, p.verificado, p.suspendido,
  p.foto_url, p.descripcion, p.notes_admin, p.fecha_fin_gratuito, -- Note: in fase6 it is p.notas_admin, let's keep p.notas_admin
  p.matricula,
  pr.created_at,
  COALESCE(AVG(r.estrellas), 0)::float  AS rating_promedio,
  COUNT(DISTINCT r.id)::int              AS total_resenas,
  MAX(cl.created_at)                    AS ultimo_contacto
FROM public.prestadores p
JOIN public.profiles pr ON pr.id = p.id
LEFT JOIN public.resenas r  ON r.prestador_id = p.id
LEFT JOIN public.contactos_log cl ON cl.prestador_id = p.id
GROUP BY p.id, pr.nombre, pr.whatsapp, p.oficio, p.oficios,
         p.zonas_trabajo, p.activo, p.verificado, p.suspendido,
         p.foto_url, p.descripcion, p.notas_admin,
         p.fecha_fin_gratuito, p.matricula, pr.created_at;

REVOKE SELECT ON public.admin_prestadores FROM anon;
GRANT  SELECT ON public.admin_prestadores TO authenticated;
