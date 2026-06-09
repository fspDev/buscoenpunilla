-- ============================================================
-- BUSCO — Fase 3: Directorio de prestadores
-- Ejecutar en el SQL Editor del dashboard de Supabase
-- ============================================================

-- ─── TABLA: contactos_log ────────────────────────────────────
create table public.contactos_log (
  id           uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references public.prestadores(id) on delete cascade,
  cliente_id   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

alter table public.contactos_log enable row level security;

-- Cualquiera puede insertar (incluso usuarios no autenticados)
create policy "contactos_log: insertar público"
  on public.contactos_log for insert
  with check (true);

-- Solo el prestador dueño puede leer sus propios registros
create policy "contactos_log: leer prestador dueño"
  on public.contactos_log for select
  using (auth.uid() = prestador_id);

-- Admin puede leer todos
create policy "contactos_log: leer admin"
  on public.contactos_log for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─── VISTA: prestadores_publicos ─────────────────────────────
create or replace view public.prestadores_publicos as
select
  p.id,
  pr.nombre,
  p.oficio,
  p.descripcion,
  p.foto_url,
  p.zonas_trabajo,
  pr.whatsapp,
  coalesce(avg(r.estrellas), 0)::float     as rating_promedio,
  count(r.id)::int                          as total_resenas
from public.prestadores p
join public.profiles pr on pr.id = p.id
left join public.resenas r on r.prestador_id = p.id
where p.activo = true
group by p.id, pr.nombre, p.oficio, p.descripcion, p.foto_url, p.zonas_trabajo, pr.whatsapp;

-- Dar acceso público a la vista (anon y authenticated)
grant select on public.prestadores_publicos to anon, authenticated;

-- ─── STORAGE: bucket fotos-perfil ────────────────────────────
insert into storage.buckets (id, name, public)
values ('fotos-perfil', 'fotos-perfil', true)
on conflict (id) do nothing;

-- Cualquiera puede ver las fotos de perfil
create policy "fotos-perfil: lectura pública"
  on storage.objects for select
  using (bucket_id = 'fotos-perfil');

-- Solo el usuario autenticado puede subir su propia foto
create policy "fotos-perfil: subir propio"
  on storage.objects for insert
  with check (
    bucket_id = 'fotos-perfil' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
