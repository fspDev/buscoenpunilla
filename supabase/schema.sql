-- ============================================================
-- BUSCO — Schema inicial
-- Ejecutar en el SQL Editor del dashboard de Supabase
-- ============================================================

-- ─── TIPOS ───────────────────────────────────────────────────
create type public.role as enum ('cliente', 'prestador', 'admin');

-- ─── TABLA: profiles ─────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       public.role not null default 'cliente',
  nombre     text,
  whatsapp   text,
  localidad  text,
  created_at timestamptz not null default now()
);

-- Trigger: crea un perfil automáticamente al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── TABLA: prestadores ──────────────────────────────────────
create table public.prestadores (
  id           uuid primary key references public.profiles(id) on delete cascade,
  oficio       text,
  descripcion  text,
  foto_url     text,
  zonas_trabajo text[],
  activo       boolean not null default true,
  verificado   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ─── TABLA: resenas ──────────────────────────────────────────
create table public.resenas (
  id                  uuid primary key default gen_random_uuid(),
  prestador_id        uuid not null references public.prestadores(id) on delete cascade,
  cliente_id          uuid not null references public.profiles(id) on delete cascade,
  estrellas           int not null check (estrellas between 1 and 5),
  comentario          text,
  respuesta_prestador text,
  created_at          timestamptz not null default now()
);

-- ─── TABLA: fotos_trabajos ───────────────────────────────────
create table public.fotos_trabajos (
  id           uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references public.prestadores(id) on delete cascade,
  url          text not null,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.prestadores    enable row level security;
alter table public.resenas        enable row level security;
alter table public.fotos_trabajos enable row level security;

-- ─── RLS: profiles ───────────────────────────────────────────
-- Cada usuario puede leer y editar solo su propio perfil
create policy "profiles: leer propio"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: editar propio"
  on public.profiles for update
  using (auth.uid() = id);

-- ─── RLS: prestadores ────────────────────────────────────────
-- Cualquiera puede leer prestadores activos (incluso anónimos)
create policy "prestadores: lectura pública de activos"
  on public.prestadores for select
  using (activo = true);

-- Solo el dueño puede editar su propio perfil
create policy "prestadores: editar propio"
  on public.prestadores for update
  using (auth.uid() = id);

-- Solo el dueño puede crear su perfil de prestador
create policy "prestadores: crear propio"
  on public.prestadores for insert
  with check (auth.uid() = id);

-- ─── RLS: resenas ────────────────────────────────────────────
-- Cualquiera puede leer reseñas
create policy "resenas: lectura pública"
  on public.resenas for select
  using (true);

-- Solo usuarios autenticados pueden crear reseñas
create policy "resenas: crear autenticado"
  on public.resenas for insert
  with check (auth.uid() is not null and auth.uid() = cliente_id);

-- El prestador puede editar solo su campo respuesta_prestador
create policy "resenas: responder prestador"
  on public.resenas for update
  using (
    auth.uid() = prestador_id
  )
  with check (
    auth.uid() = prestador_id
  );

-- ─── RLS: fotos_trabajos ─────────────────────────────────────
-- Cualquiera puede ver las fotos
create policy "fotos_trabajos: lectura pública"
  on public.fotos_trabajos for select
  using (true);

-- Solo el prestador dueño puede subir fotos
create policy "fotos_trabajos: crear prestador dueño"
  on public.fotos_trabajos for insert
  with check (auth.uid() = prestador_id);

-- Solo el prestador dueño puede eliminar sus fotos
create policy "fotos_trabajos: eliminar prestador dueño"
  on public.fotos_trabajos for delete
  using (auth.uid() = prestador_id);
