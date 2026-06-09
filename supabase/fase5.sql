-- ============================================================
-- BUSCO — Fase 5: Panel del prestador
-- Ejecutar en el SQL Editor del dashboard de Supabase
-- ============================================================

-- ─── TABLA: impresiones_busqueda ─────────────────────────────
CREATE TABLE public.impresiones_busqueda (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prestador_id   uuid NOT NULL REFERENCES public.prestadores(id) ON DELETE CASCADE,
  oficio_buscado text,
  zona_buscada   text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.impresiones_busqueda ENABLE ROW LEVEL SECURITY;

-- Inserción pública (sin autenticación)
CREATE POLICY "impresiones: insertar público"
  ON public.impresiones_busqueda FOR INSERT
  WITH CHECK (true);

-- El prestador dueño puede leer sus propias impresiones
CREATE POLICY "impresiones: leer propio"
  ON public.impresiones_busqueda FOR SELECT
  USING (auth.uid() = prestador_id);

-- Admin puede leer todas
CREATE POLICY "impresiones: leer admin"
  ON public.impresiones_busqueda FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── STORAGE: bucket fotos-trabajos ──────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos-trabajos', 'fotos-trabajos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "fotos-trabajos: lectura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fotos-trabajos');

CREATE POLICY "fotos-trabajos: subir propio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fotos-trabajos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "fotos-trabajos: eliminar propio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fotos-trabajos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
