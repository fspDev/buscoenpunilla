-- ============================================================
-- BUSCO — Fix definitivo del flujo de registro
-- Ejecutar en SQL Editor (Role: postgres)
-- ============================================================

-- Trigger robusto: lee la metadata del usuario y crea el perfil
-- (y el registro de prestador si corresponde) con SECURITY DEFINER,
-- por lo que ignora RLS y nunca falla por falta de sesión.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role    public.role;
  v_oficios text[];
BEGIN
  -- Rol desde metadata, por defecto 'cliente'
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

  -- Si es prestador, crear su registro
  IF v_role = 'prestador' THEN
    SELECT ARRAY(
      SELECT jsonb_array_elements_text(
        COALESCE(NEW.raw_user_meta_data->'oficios', '[]'::jsonb)
      )
    ) INTO v_oficios;

    INSERT INTO public.prestadores (id, oficio, oficios, descripcion, zonas_trabajo, activo, verificado)
    VALUES (
      NEW.id,
      COALESCE(v_oficios[1], NEW.raw_user_meta_data->>'oficio'),
      NULLIF(v_oficios, '{}'),
      NEW.raw_user_meta_data->>'descripcion',
      CASE WHEN NEW.raw_user_meta_data->>'localidad' IS NOT NULL
           THEN ARRAY[NEW.raw_user_meta_data->>'localidad']
           ELSE NULL END,
      true,
      false
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Recrear el trigger (por si quedó alguna versión vieja)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
