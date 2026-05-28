-- ============================================================
-- KIPRUN — Tablas faltantes para completar la plataforma
-- Pega esto en: Supabase Dashboard → SQL Editor → New query
-- ============================================================
-- NOTA: Las tablas users, activities y user_locations ya existen.
-- Solo se agregan las columnas faltantes y las tablas nuevas.
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. AMPLIAR tabla activities (agregar columnas que faltan)
-- ─────────────────────────────────────────────────────────────
alter table public.activities
  add column if not exists elevation_meters integer not null default 0,
  add column if not exists run_type text not null default 'Trote'
    check (run_type in ('Trote','Intervalos','Tempo','Trail','Recuperación','Largo'));


-- ─────────────────────────────────────────────────────────────
-- 2. TABLA: races  (catálogo de carreras)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.races (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  category     text not null check (category in ('trail','pista')),
  distance_km  numeric(6,2) not null,
  location     text not null,
  country      text not null default 'Colombia',
  difficulty   text not null check (difficulty in ('Fácil','Moderado','Difícil','Extremo')),
  description  text,
  created_at   timestamptz not null default now()
);

-- Poblar carreras iniciales
insert into public.races (id, name, category, distance_km, location, country, difficulty, description) values
  ('a1000000-0000-0000-0000-000000000001', '5K Colina Delicias',         'trail', 5,  'Delicias, Bogotá',     'Colombia', 'Moderado', 'Carrera técnica que bordea la parte alta del cerro de Delicias, ideal para corredores locales de la zona.'),
  ('a1000000-0000-0000-0000-000000000002', 'Chicaque Trail 21K',          'trail', 21, 'Soacha, Cundinamarca', 'Colombia', 'Extremo',  'Una de las carreras de montaña más exigentes por los bosques de niebla del Parque Chicaque.'),
  ('a1000000-0000-0000-0000-000000000003', 'Media Maratón de Bogotá 21K', 'pista', 21, 'Bogotá',              'Colombia', 'Moderado', 'La carrera de calle más importante del país, a 2.600 metros de altura sobre el nivel del mar.'),
  ('a1000000-0000-0000-0000-000000000004', '10K Nocturna Bogotá',         'pista', 10, 'Bogotá',              'Colombia', 'Fácil',    'Carrera recreativa nocturna ideal para pulverizar marcas personales de velocidad.')
on conflict (id) do nothing;


-- ─────────────────────────────────────────────────────────────
-- 3. TABLA: race_results  (tiempos registrados en rankings)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.race_results (
  id             uuid primary key default gen_random_uuid(),
  race_id        uuid not null references public.races(id) on delete cascade,
  user_id        uuid not null references public.users(id) on delete cascade,
  time_seconds   integer not null check (time_seconds > 0),
  created_at     timestamptz not null default now(),
  unique (race_id, user_id)  -- un resultado por carrera por usuario
);

-- Vista de rankings con datos del corredor
create or replace view public.race_rankings as
  select
    rr.id,
    rr.race_id,
    rr.time_seconds,
    rr.created_at,
    u.id          as user_id,
    u.name,
    u.avatar,
    u.neighborhood,
    u.city,
    u.country,
    -- tiempo formateado HH:MM:SS o MM:SS
    case
      when rr.time_seconds >= 3600
        then lpad((rr.time_seconds / 3600)::text, 2, '0') || ':' ||
             lpad(((rr.time_seconds % 3600) / 60)::text, 2, '0') || ':' ||
             lpad((rr.time_seconds % 60)::text, 2, '0')
      else
             lpad((rr.time_seconds / 60)::text, 2, '0') || ':' ||
             lpad((rr.time_seconds % 60)::text, 2, '0')
    end as time_formatted
  from public.race_results rr
  join public.users u on u.id = rr.user_id;


-- ─────────────────────────────────────────────────────────────
-- 4. TABLA: meetups  (salidas grupales)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.meetups (
  id            uuid primary key default gen_random_uuid(),
  creator_id    uuid not null references public.users(id) on delete cascade,
  title         text not null,
  distance_km   numeric(5,1) not null,
  pace_label    text not null,          -- ej. "5:30 min/km"
  scheduled_at  timestamptz not null,   -- fecha y hora real del meetup
  neighborhood  text not null,
  city          text not null,
  country       text not null default 'Colombia',
  created_at    timestamptz not null default now()
);

-- Tabla pivote: inscripciones
create table if not exists public.meetup_members (
  meetup_id  uuid not null references public.meetups(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (meetup_id, user_id)
);

-- Vista con contador de inscritos
create or replace view public.meetups_with_count as
  select
    m.*,
    u.name        as creator_name,
    u.avatar      as creator_avatar,
    count(mm.user_id)::int as joined_count
  from public.meetups m
  join public.users u on u.id = m.creator_id
  left join public.meetup_members mm on mm.meetup_id = m.id
  group by m.id, u.name, u.avatar;


-- ─────────────────────────────────────────────────────────────
-- 5. TABLA: community_messages  (chat del barrio en SocialHub)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.community_messages (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  neighborhood text not null,
  city         text not null,
  content      text not null check (char_length(content) between 1 and 500),
  created_at   timestamptz not null default now()
);

-- Vista con datos del autor
create or replace view public.community_messages_full as
  select
    cm.*,
    u.name   as sender_name,
    u.avatar as sender_avatar
  from public.community_messages cm
  join public.users u on u.id = cm.user_id;


-- ─────────────────────────────────────────────────────────────
-- 6. TABLAS: group_chats + group_members + group_messages
-- ─────────────────────────────────────────────────────────────
create table if not exists public.group_chats (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  creator_id  uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id   uuid not null references public.group_chats(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.group_messages (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.group_chats(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- Vista con datos del autor
create or replace view public.group_messages_full as
  select
    gm.*,
    u.name   as sender_name,
    u.avatar as sender_avatar
  from public.group_messages gm
  join public.users u on u.id = gm.user_id;


-- ─────────────────────────────────────────────────────────────
-- 7. TABLA: user_badges  (logros desbloqueados)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.user_badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  badge_key   text not null,
    -- 'leyenda_local' | 'trail_hunter' | 'sub20_5k' | 'global_explorer'
  unlocked_at timestamptz not null default now(),
  unique (user_id, badge_key)
);


-- ─────────────────────────────────────────────────────────────
-- 8. ÍNDICES para búsquedas rápidas
-- ─────────────────────────────────────────────────────────────
create index if not exists idx_activities_user     on public.activities(user_id);
create index if not exists idx_activities_date     on public.activities(activity_date desc);
create index if not exists idx_race_results_race   on public.race_results(race_id);
create index if not exists idx_race_results_user   on public.race_results(user_id);
create index if not exists idx_meetups_city        on public.meetups(city, neighborhood);
create index if not exists idx_meetups_scheduled   on public.meetups(scheduled_at);
create index if not exists idx_comm_msgs_location  on public.community_messages(city, neighborhood, created_at desc);
create index if not exists idx_group_msgs_group    on public.group_messages(group_id, created_at asc);


-- ─────────────────────────────────────────────────────────────
-- 9. RLS — Row Level Security
-- ─────────────────────────────────────────────────────────────

-- races (catálogo público)
alter table public.races enable row level security;
create policy "carreras públicas"       on public.races for select using (true);

-- race_results
alter table public.race_results enable row level security;
create policy "resultados públicos"     on public.race_results for select using (true);
create policy "usuario registra tiempo" on public.race_results for insert with check (auth.uid() = user_id);
create policy "usuario actualiza tiempo"on public.race_results for update using (auth.uid() = user_id);

-- meetups
alter table public.meetups enable row level security;
create policy "meetups públicos"        on public.meetups for select using (true);
create policy "usuario crea meetup"     on public.meetups for insert with check (auth.uid() = creator_id);
create policy "creador borra meetup"    on public.meetups for delete using (auth.uid() = creator_id);

-- meetup_members
alter table public.meetup_members enable row level security;
create policy "membresías públicas"     on public.meetup_members for select using (true);
create policy "usuario se une"          on public.meetup_members for insert with check (auth.uid() = user_id);
create policy "usuario se sale"         on public.meetup_members for delete using (auth.uid() = user_id);

-- community_messages
alter table public.community_messages enable row level security;
create policy "mensajes comunidad públicos" on public.community_messages for select using (true);
create policy "usuario envía mensaje"       on public.community_messages for insert with check (auth.uid() = user_id);

-- group_chats
alter table public.group_chats enable row level security;
create policy "miembro ve su grupo"     on public.group_chats for select
  using (exists (
    select 1 from public.group_members gm
    where gm.group_id = id and gm.user_id = auth.uid()
  ));
create policy "usuario crea grupo"      on public.group_chats for insert with check (auth.uid() = creator_id);

-- group_members
alter table public.group_members enable row level security;
create policy "miembro ve miembros"     on public.group_members for select
  using (exists (
    select 1 from public.group_members gm
    where gm.group_id = group_id and gm.user_id = auth.uid()
  ));
create policy "usuario se agrega"       on public.group_members for insert with check (auth.uid() = user_id);
create policy "usuario abandona grupo"  on public.group_members for delete using (auth.uid() = user_id);

-- group_messages
alter table public.group_messages enable row level security;
create policy "miembro lee mensajes"    on public.group_messages for select
  using (exists (
    select 1 from public.group_members gm
    where gm.group_id = group_id and gm.user_id = auth.uid()
  ));
create policy "miembro envía mensajes"  on public.group_messages for insert
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_id and gm.user_id = auth.uid()
    )
  );

-- user_badges
alter table public.user_badges enable row level security;
create policy "badges públicos"         on public.user_badges for select using (true);
create policy "sistema inserta badge"   on public.user_badges for insert with check (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────
-- 10. REALTIME — Habilitar para mensajes en vivo
--     Supabase Dashboard → Database → Replication → supabase_realtime
--     Activa el toggle para estas tablas:
--       ✅ community_messages
--       ✅ group_messages
--       ✅ meetups
--       ✅ meetup_members
-- ─────────────────────────────────────────────────────────────
