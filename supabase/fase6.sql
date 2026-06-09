-- ============================================================
-- BUSCO — Fase 6: Panel de administración
-- Ejecutar en el SQL Editor del dashboard de Supabase
-- ============================================================

-- ─── ALTERACIONES A TABLA prestadores ────────────────────────
ALTER TABLE public.prestadores
  ADD COLUMN IF NOT EXISTS suspendido          boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notas_admin         text,
  ADD COLUMN IF NOT EXISTS fecha_fin_gratuito  timestamptz;

-- ─── ALTERACIONES A TABLA reportes_resenas ───────────────────
ALTER TABLE public.reportes_resenas
  ADD COLUMN IF NOT EXISTS resuelto    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS resuelto_at timestamptz;

-- ─── TABLA: auditoria_admin ──────────────────────────────────
CREATE TABLE public.auditoria_admin (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  accion      text NOT NULL,
  entidad_id  uuid,
  detalle     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.auditoria_admin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auditoria: solo admin"
  ON public.auditoria_admin
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── VISTA: admin_prestadores ─────────────────────────────────
-- Vista enriquecida para la tabla del admin
CREATE OR REPLACE VIEW public.admin_prestadores AS
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

GRANT SELECT ON public.admin_prestadores TO authenticated;

-- ─── VISTA: admin_clientes ────────────────────────────────────
CREATE OR REPLACE VIEW public.admin_clientes AS
SELECT
  pr.id,
  pr.nombre,
  au.email,
  pr.localidad,
  pr.whatsapp,
  pr.created_at,
  COUNT(DISTINCT r.id)::int   AS total_resenas,
  COUNT(DISTINCT cl.id)::int  AS total_contactos
FROM public.profiles pr
JOIN auth.users au ON au.id = pr.id
LEFT JOIN public.resenas r ON r.cliente_id = pr.id
LEFT JOIN public.contactos_log cl ON cl.cliente_id = pr.id
WHERE pr.role = 'cliente'
GROUP BY pr.id, pr.nombre, au.email, pr.localidad, pr.whatsapp, pr.created_at;

GRANT SELECT ON public.admin_clientes TO authenticated;

-- ─── CÓMO CREAR EL PRIMER ADMIN ──────────────────────────────
-- 1. Registrarse normalmente en /auth/registro/cliente
-- 2. Copiar el UUID del usuario desde Authentication → Users en Supabase
-- 3. Ejecutar este SQL con el UUID correspondiente:
--
--    UPDATE public.profiles SET role = 'admin' WHERE id = 'PEGAR-UUID-AQUÍ';
