-- ============================================================
-- BUSCO — Schema completo
-- Aplicar en Supabase Dashboard → SQL Editor
-- Es seguro correr múltiples veces (usa IF NOT EXISTS / OR REPLACE)
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. EXTENSIONES
-- ════════════════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ════════════════════════════════════════════════════════════
-- 2. TABLAS BASE
-- ════════════════════════════════════════════════════════════

-- Perfiles de todos los usuarios (cliente / prestador / admin)
CREATE TABLE IF NOT EXISTS profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'prestador', 'admin')),
  nombre       TEXT,
  whatsapp     TEXT,
  localidad    TEXT,
  foto_url     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Datos profesionales del prestador
CREATE TABLE IF NOT EXISTS prestadores (
  id                  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  oficio              TEXT,
  oficios             TEXT[],
  descripcion         TEXT,
  foto_url            TEXT,
  zonas_trabajo       TEXT[],
  activo              BOOLEAN NOT NULL DEFAULT TRUE,
  verificado          BOOLEAN NOT NULL DEFAULT FALSE,
  suspendido          BOOLEAN NOT NULL DEFAULT FALSE,
  notas_admin         TEXT,
  matricula           TEXT,
  fecha_fin_gratuito  TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '60 days'),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reseñas
CREATE TABLE IF NOT EXISTS resenas (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prestador_id         UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
  cliente_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  estrellas            INT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
  comentario           TEXT,
  respuesta_prestador  TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (prestador_id, cliente_id)
);

-- Fotos de trabajos
CREATE TABLE IF NOT EXISTS fotos_trabajos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prestador_id  UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reportes de reseñas
CREATE TABLE IF NOT EXISTS reportes_resenas (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resena_id     UUID NOT NULL REFERENCES resenas(id) ON DELETE CASCADE,
  reportado_por UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  motivo        TEXT NOT NULL,
  resuelto      BOOLEAN NOT NULL DEFAULT FALSE,
  resuelto_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registro de contactos vía WhatsApp
CREATE TABLE IF NOT EXISTS contactos_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prestador_id  UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
  cliente_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Impresiones en búsquedas
CREATE TABLE IF NOT EXISTS impresiones_busqueda (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prestador_id    UUID NOT NULL REFERENCES prestadores(id) ON DELETE CASCADE,
  oficio_buscado  TEXT,
  zona_buscada    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mensajes de contacto (formulario público)
CREATE TABLE IF NOT EXISTS mensajes_contacto (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  email       TEXT NOT NULL,
  tipo        TEXT NOT NULL,
  mensaje     TEXT NOT NULL,
  leido       BOOLEAN NOT NULL DEFAULT FALSE,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auditoría de acciones admin
CREATE TABLE IF NOT EXISTS auditoria_admin (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  accion      TEXT NOT NULL,
  entidad_id  UUID,
  detalle     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ════════════════════════════════════════════════════════════
-- 3. TRIGGER: crear profile + prestadores al registrarse
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear perfil base
  INSERT INTO public.profiles (id, role, nombre, whatsapp, localidad)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cliente'),
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'localidad'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Si es prestador, crear fila en prestadores
  IF (NEW.raw_user_meta_data->>'role') = 'prestador' THEN
    INSERT INTO public.prestadores (id, oficio, oficios, descripcion, zonas_trabajo, fecha_fin_gratuito)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'oficio',
      CASE
        WHEN NEW.raw_user_meta_data->>'oficios' IS NOT NULL
        THEN ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'oficios'))
        ELSE ARRAY[NEW.raw_user_meta_data->>'oficio']
      END,
      NEW.raw_user_meta_data->>'descripcion',
      ARRAY[NEW.raw_user_meta_data->>'localidad'],
      NOW() + INTERVAL '60 days'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════
-- 4. FUNCIÓN: actualizar rating_promedio al insertar/editar reseña
-- ════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION actualizar_rating_prestador()
RETURNS TRIGGER AS $$
BEGIN
  -- Se recalcula automáticamente con la vista, no hace falta nada aquí.
  -- Este trigger existe por si se quiere cachear en la tabla prestadores.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ════════════════════════════════════════════════════════════
-- 5. VISTAS
-- Se hace DROP primero para evitar conflictos de nombres de columnas
-- (CREATE OR REPLACE VIEW no permite renombrar columnas existentes)
-- ════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS prestadores_publicos CASCADE;
DROP VIEW IF EXISTS admin_prestadores    CASCADE;
DROP VIEW IF EXISTS admin_clientes       CASCADE;

-- Vista pública de prestadores activos
CREATE VIEW prestadores_publicos
WITH (security_invoker = true)
AS
SELECT
  p.id,
  pr.nombre,
  p.oficio,
  p.oficios,
  p.descripcion,
  COALESCE(p.foto_url, pr.foto_url) AS foto_url,
  p.zonas_trabajo,
  pr.whatsapp,
  COALESCE(ROUND(AVG(r.estrellas)::NUMERIC, 1), 0) AS rating_promedio,
  COUNT(r.id)::INT                                  AS total_resenas,
  p.matricula
FROM prestadores p
JOIN profiles pr ON pr.id = p.id
LEFT JOIN resenas r ON r.prestador_id = p.id
WHERE p.activo = TRUE
  AND p.suspendido = FALSE
GROUP BY p.id, pr.nombre, pr.whatsapp, pr.foto_url;


-- Vista admin: prestadores con datos completos
CREATE VIEW admin_prestadores AS
SELECT
  p.id,
  pr.nombre,
  pr.whatsapp,
  p.oficio,
  p.oficios,
  p.zonas_trabajo,
  p.activo,
  p.verificado,
  p.suspendido,
  COALESCE(p.foto_url, pr.foto_url) AS foto_url,
  p.descripcion,
  p.notas_admin,
  p.fecha_fin_gratuito,
  p.matricula,
  p.created_at,
  COALESCE(ROUND(AVG(r.estrellas)::NUMERIC, 1), 0) AS rating_promedio,
  COUNT(r.id)::INT                                  AS total_resenas,
  MAX(cl.created_at)                                AS ultimo_contacto
FROM prestadores p
JOIN profiles pr ON pr.id = p.id
LEFT JOIN resenas r         ON r.prestador_id  = p.id
LEFT JOIN contactos_log cl  ON cl.prestador_id = p.id
GROUP BY p.id, pr.id, pr.nombre, pr.whatsapp, pr.foto_url;


-- Vista admin: clientes
CREATE VIEW admin_clientes AS
SELECT
  pr.id,
  pr.nombre,
  u.email,
  pr.localidad,
  pr.whatsapp,
  pr.created_at,
  COUNT(DISTINCT r.id)::INT   AS total_resenas,
  COUNT(DISTINCT cl.id)::INT  AS total_contactos
FROM profiles pr
JOIN auth.users u ON u.id = pr.id
LEFT JOIN resenas r         ON r.cliente_id    = pr.id
LEFT JOIN contactos_log cl  ON cl.cliente_id   = pr.id
WHERE pr.role = 'cliente'
GROUP BY pr.id, pr.nombre, u.email, pr.localidad, pr.whatsapp, pr.created_at;


-- ════════════════════════════════════════════════════════════
-- 6. ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestadores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_trabajos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_resenas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE impresiones_busqueda ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_contacto    ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_admin      ENABLE ROW LEVEL SECURITY;

-- ── profiles ──────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles: lectura propia o admin"    ON profiles;
DROP POLICY IF EXISTS "profiles: actualizar propio"         ON profiles;
DROP POLICY IF EXISTS "profiles: lectura pública de nombre" ON profiles;

CREATE POLICY "profiles: lectura pública de nombre"
  ON profiles FOR SELECT
  USING (true);  -- nombre e id son datos públicos (necesario para reseñas)

CREATE POLICY "profiles: actualizar propio"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── prestadores ───────────────────────────────────────────
DROP POLICY IF EXISTS "prestadores: lectura pública activos"  ON prestadores;
DROP POLICY IF EXISTS "prestadores: actualizar propio"        ON prestadores;
DROP POLICY IF EXISTS "prestadores: lectura admin"            ON prestadores;

CREATE POLICY "prestadores: lectura pública activos"
  ON prestadores FOR SELECT
  USING (activo = TRUE AND suspendido = FALSE);

CREATE POLICY "prestadores: leer propio"
  ON prestadores FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "prestadores: actualizar propio"
  ON prestadores FOR UPDATE
  USING (auth.uid() = id);

-- ── resenas ───────────────────────────────────────────────
DROP POLICY IF EXISTS "resenas: lectura pública"  ON resenas;
DROP POLICY IF EXISTS "resenas: insertar cliente" ON resenas;
DROP POLICY IF EXISTS "resenas: responder prestador" ON resenas;

CREATE POLICY "resenas: lectura pública"
  ON resenas FOR SELECT USING (true);

CREATE POLICY "resenas: insertar cliente"
  ON resenas FOR INSERT
  WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "resenas: responder prestador"
  ON resenas FOR UPDATE
  USING (auth.uid() = prestador_id);

-- ── fotos_trabajos ────────────────────────────────────────
DROP POLICY IF EXISTS "fotos: lectura pública"    ON fotos_trabajos;
DROP POLICY IF EXISTS "fotos: gestionar propias"  ON fotos_trabajos;

CREATE POLICY "fotos: lectura pública"
  ON fotos_trabajos FOR SELECT USING (true);

CREATE POLICY "fotos: gestionar propias"
  ON fotos_trabajos FOR ALL
  USING (auth.uid() = prestador_id);

-- ── contactos_log ─────────────────────────────────────────
DROP POLICY IF EXISTS "contactos: insertar" ON contactos_log;
DROP POLICY IF EXISTS "contactos: leer propio prestador" ON contactos_log;

CREATE POLICY "contactos: insertar"
  ON contactos_log FOR INSERT WITH CHECK (true);

CREATE POLICY "contactos: leer propio prestador"
  ON contactos_log FOR SELECT
  USING (auth.uid() = prestador_id);

-- ── impresiones ───────────────────────────────────────────
DROP POLICY IF EXISTS "impresiones: insertar" ON impresiones_busqueda;
DROP POLICY IF EXISTS "impresiones: leer propio" ON impresiones_busqueda;

CREATE POLICY "impresiones: insertar"
  ON impresiones_busqueda FOR INSERT WITH CHECK (true);

CREATE POLICY "impresiones: leer propio"
  ON impresiones_busqueda FOR SELECT
  USING (auth.uid() = prestador_id);

-- ── mensajes_contacto ─────────────────────────────────────
DROP POLICY IF EXISTS "mensajes: insertar público" ON mensajes_contacto;

CREATE POLICY "mensajes: insertar público"
  ON mensajes_contacto FOR INSERT WITH CHECK (true);

-- ── reportes_resenas ──────────────────────────────────────
DROP POLICY IF EXISTS "reportes: insertar cliente" ON reportes_resenas;

CREATE POLICY "reportes: insertar cliente"
  ON reportes_resenas FOR INSERT
  WITH CHECK (auth.uid() = reportado_por);

-- ── auditoria_admin ───────────────────────────────────────
DROP POLICY IF EXISTS "auditoria: solo admin" ON auditoria_admin;

CREATE POLICY "auditoria: solo admin"
  ON auditoria_admin FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ════════════════════════════════════════════════════════════
-- 7. PERMISOS SERVICE ROLE (para admin y cron)
-- ════════════════════════════════════════════════════════════
GRANT ALL ON ALL TABLES    IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT ON admin_prestadores TO service_role;
GRANT SELECT ON admin_clientes    TO service_role;
GRANT SELECT ON prestadores_publicos TO anon, authenticated;


-- ════════════════════════════════════════════════════════════
-- 8. MIGRACIÓN: período de prueba 60 días
-- (incluye lo de migracion-periodo-prueba.sql)
-- ════════════════════════════════════════════════════════════
ALTER TABLE prestadores
  ALTER COLUMN fecha_fin_gratuito SET DEFAULT (NOW() + INTERVAL '60 days');

UPDATE prestadores
  SET fecha_fin_gratuito = created_at + INTERVAL '60 days'
  WHERE fecha_fin_gratuito IS NULL;


-- ════════════════════════════════════════════════════════════
-- 9. LIMPIEZA DE DATOS DE PRUEBA
-- DESCOMENTÁ solo si querés borrar cuentas de prueba.
-- CUIDADO: irreversible.
-- ════════════════════════════════════════════════════════════
/*
-- Ver qué usuarios existen antes de borrar:
SELECT p.id, p.nombre, p.role, u.email, p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at;

-- Eliminar un usuario específico por email:
DELETE FROM auth.users WHERE email = 'test@ejemplo.com';

-- Eliminar TODOS los usuarios que NO sean admin
-- (SOLO si querés limpiar todo y arrancar de cero):
-- DELETE FROM auth.users
-- WHERE id NOT IN (SELECT id FROM profiles WHERE role = 'admin');
*/
