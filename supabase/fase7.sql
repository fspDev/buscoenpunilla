-- ============================================================
-- BUSCO — Fase 7: Mejoras finales
-- Ejecutar en el SQL Editor del dashboard de Supabase
-- ============================================================

-- ─── foto_url en profiles ─────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS foto_url text;

-- ─── oficios[] en prestadores ────────────────────────────────
ALTER TABLE public.prestadores ADD COLUMN IF NOT EXISTS oficios text[];

-- Migrar oficio → oficios[0] en registros existentes
UPDATE public.prestadores
SET oficios = ARRAY[oficio]
WHERE oficio IS NOT NULL AND (oficios IS NULL OR oficios = '{}');

-- ─── TABLA: mensajes_contacto ─────────────────────────────────
CREATE TABLE public.mensajes_contacto (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  email      text NOT NULL,
  tipo       text NOT NULL,
  mensaje    text NOT NULL,
  leido      boolean NOT NULL DEFAULT false,
  user_id    uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mensajes_contacto ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede insertar (formulario público)
CREATE POLICY "mensajes_contacto: insertar público"
  ON public.mensajes_contacto FOR INSERT
  WITH CHECK (true);

-- Solo admin puede leer y actualizar
CREATE POLICY "mensajes_contacto: admin"
  ON public.mensajes_contacto
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Actualizar vista prestadores_publicos con oficios[] ──────
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
  COALESCE(AVG(r.estrellas), 0)::float   AS rating_promedio,
  COUNT(r.id)::int                        AS total_resenas
FROM public.prestadores p
JOIN public.profiles pr ON pr.id = p.id
LEFT JOIN public.resenas r ON r.prestador_id = p.id
WHERE p.activo = true
GROUP BY p.id, pr.nombre, pr.foto_url, p.oficio, p.oficios,
         p.descripcion, p.foto_url, p.zonas_trabajo, pr.whatsapp;

GRANT SELECT ON public.prestadores_publicos TO anon, authenticated;

-- ─── Actualizar admin_prestadores con oficios[] ───────────────
DROP VIEW IF EXISTS public.admin_prestadores;

CREATE VIEW public.admin_prestadores
WITH (security_invoker = true)
AS
SELECT
  p.id, pr.nombre, pr.whatsapp,
  p.oficio, p.oficios, p.zonas_trabajo,
  p.activo, p.verificado, p.suspendido,
  p.foto_url, p.descripcion, p.notas_admin, p.fecha_fin_gratuito,
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
         p.fecha_fin_gratuito, pr.created_at;

REVOKE SELECT ON public.admin_prestadores FROM anon;
GRANT  SELECT ON public.admin_prestadores TO authenticated;
