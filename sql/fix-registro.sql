-- ============================================================
-- BUSCO — FIX del registro (17-jun-2026)
-- Aplicar en Supabase Dashboard → SQL Editor (Role: postgres)
--
-- PROBLEMA:
--   El trigger handle_new_user insertaba el rol como TEXT en la
--   columna `role` (tipo enum public.role) SIN castear. PostgreSQL
--   no permite asignación implícita text → enum, así que TODA alta
--   fallaba con "Database error saving new user" (cliente y
--   prestador, incluso sin metadata).
--
-- SOLUCIÓN:
--   · Castear el rol al enum con manejo seguro de vacío/NULL.
--   · Fijar search_path = public (buena práctica en SECURITY DEFINER).
--   · Envolver la creación del prestador en un sub-bloque para que,
--     ante cualquier inconsistencia futura, el alta del usuario NUNCA
--     se bloquee.
--
-- Es idempotente: se puede correr varias veces sin romper nada.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role    public.role;
  v_oficios text[];
BEGIN
  -- Rol desde metadata → enum, por defecto 'cliente'
  v_role := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'role', '')::public.role,
    'cliente'
  );

  -- Crear / actualizar el perfil
  INSERT INTO public.profiles (id, role, nombre, whatsapp, localidad)
  VALUES (
    NEW.id,
    v_role,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'localidad'
  )
  ON CONFLICT (id) DO UPDATE SET
    role      = EXCLUDED.role,
    nombre    = EXCLUDED.nombre,
    whatsapp  = EXCLUDED.whatsapp,
    localidad = EXCLUDED.localidad;

  -- Si es prestador, crear su registro (sin bloquear el alta ante errores)
  IF v_role = 'prestador' THEN
    BEGIN
      SELECT ARRAY(
        SELECT jsonb_array_elements_text(
          COALESCE(NEW.raw_user_meta_data->'oficios', '[]'::jsonb)
        )
      ) INTO v_oficios;

      INSERT INTO public.prestadores
        (id, oficio, oficios, descripcion, zonas_trabajo, activo, verificado)
      VALUES (
        NEW.id,
        COALESCE(v_oficios[1], NEW.raw_user_meta_data->>'oficio', 'Otro'),
        NULLIF(v_oficios, '{}'),
        NEW.raw_user_meta_data->>'descripcion',
        CASE WHEN NEW.raw_user_meta_data->>'localidad' IS NOT NULL
             THEN ARRAY[NEW.raw_user_meta_data->>'localidad']
             ELSE NULL END,
        true,
        false
      )
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- No abortar la creación del usuario por un problema en prestadores.
      RAISE WARNING 'handle_new_user: fallo creando prestador % : %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Recrear el trigger (por si quedó alguna versión vieja apuntando a la función)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Defensa extra: asegurar que exista una política de INSERT en profiles
-- (la función es SECURITY DEFINER y la sortea, pero esto evita sorpresas
--  si alguna vez se inserta un perfil desde un rol autenticado).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND cmd = 'INSERT'
  ) THEN
    CREATE POLICY "profiles insert propio"
      ON public.profiles FOR INSERT
      WITH CHECK (id = (SELECT auth.uid()));
  END IF;
END $$;

-- Verificación rápida
SELECT 'trigger' AS objeto,
       (SELECT COUNT(*) FROM pg_trigger WHERE tgname = 'on_auth_user_created')::text AS total;
